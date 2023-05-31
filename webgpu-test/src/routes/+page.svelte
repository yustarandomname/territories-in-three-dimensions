<script lang="ts">
	import { onMount } from 'svelte';

	import shaderString from './shader.wgsl?raw';
	import computeString from './computeShader.wgsl?raw';

	let canvasEl: HTMLCanvasElement;
	const UPDATE_INTERVAL = 1000; // Update every 200ms (5 times/sec)
	const GRID_SIZE = 32; // Number of cells in each dimension
	const WORKGROUP_SIZE = 8;

	let step = 0; // Track how many simulation steps have been run

	async function setupGPU() {
		if (!navigator.gpu) {
			throw new Error('WebGPU not supported on this browser.');
		}

		const adapter = await navigator.gpu.requestAdapter();
		if (!adapter) {
			throw new Error('No appropriate GPUAdapter found.');
		}

		const device = await adapter.requestDevice();

		const context = canvasEl.getContext('webgpu');
		if (!context) {
			throw new Error('WebGPU not supported on this browser.');
		}
		const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
		context.configure({
			device: device,
			format: canvasFormat
		});

		return { device, canvasFormat, context };
	}

	onMount(async () => {
		const { device, canvasFormat, context } = await setupGPU();

		const vertices = new Float32Array([
			//   X,    Y,
			-0.8,
			-0.8, // Triangle 1 (Blue)
			0.8,
			-0.8,
			0.8,
			0.8,

			-0.8,
			-0.8, // Triangle 2 (Red)
			0.8,
			0.8,
			-0.8,
			0.8
		]);

		const vertexBuffer = device.createBuffer({
			label: 'Cell vertices',
			size: vertices.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

		// Create a uniform buffer that describes the grid.
		const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
		console.log({ uniformArray }, uniformArray.byteLength);
		const uniformBuffer = device.createBuffer({
			label: 'Grid Uniforms',
			size: uniformArray.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});
		device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

		const vertexBufferLayout = {
			arrayStride: 8,
			attributes: [
				{
					format: 'float32x2',
					offset: 0,
					shaderLocation: 0 // Position, see vertex shader
				}
			]
		} satisfies GPUVertexBufferLayout;

		// Create an array representing the active state of each cell.
		const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE);

		// Create a storage buffer to hold the cell state.
		const cellStateStorage: [GPUBuffer, GPUBuffer] = [
			device.createBuffer({
				label: 'Cell State A',
				size: cellStateArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			}),
			device.createBuffer({
				label: 'Cell State B',
				size: cellStateArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			})
		];

		for (let i = 0; i < cellStateArray.length; ++i) {
			cellStateArray[i] = Math.random() > 0.6 ? 1 : 0;
		}
		device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);

		const cellShaderModule = device.createShaderModule({
			label: 'Cell shader',
			code: shaderString
		});

		const simulationShaderModule = device.createShaderModule({
			label: 'Game of Life simulation shader',
			code: computeString
		});

		const bindGroupLayout = device.createBindGroupLayout({
			label: 'Cell Bind Group Layout',
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
					buffer: {} // Grid uniform buffer
				},
				{
					binding: 1,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
					buffer: { type: 'read-only-storage' } // Cell state input buffer
				},
				{
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'storage' } // Cell state output buffer
				}
			]
		});

		const pipelineLayout = device.createPipelineLayout({
			label: 'Cell Pipeline Layout',
			bindGroupLayouts: [bindGroupLayout]
		});

		const cellPipeline = device.createRenderPipeline({
			label: 'Cell pipeline',
			layout: pipelineLayout,
			vertex: {
				module: cellShaderModule,
				entryPoint: 'vertexMain',
				buffers: [vertexBufferLayout]
			},
			fragment: {
				module: cellShaderModule,
				entryPoint: 'fragmentMain',
				targets: [
					{
						format: canvasFormat
					}
				]
			}
		});

		// Create a compute pipeline that updates the game state.
		const simulationPipeline = device.createComputePipeline({
			label: 'Simulation pipeline',
			layout: pipelineLayout,
			compute: {
				module: simulationShaderModule,
				entryPoint: 'computeMain'
			}
		});

		const bindGroups = [
			device.createBindGroup({
				label: 'Cell renderer bind group A',
				layout: bindGroupLayout,
				entries: [
					{
						binding: 0,
						resource: { buffer: uniformBuffer }
					},
					{
						binding: 1,
						resource: { buffer: cellStateStorage[0] }
					},
					{
						binding: 2,
						resource: { buffer: cellStateStorage[1] }
					}
				]
			}),
			device.createBindGroup({
				label: 'Cell renderer bind group B',
				layout: bindGroupLayout,
				entries: [
					{
						binding: 0,
						resource: { buffer: uniformBuffer }
					},
					{
						binding: 1,
						resource: { buffer: cellStateStorage[1] }
					},
					{
						binding: 2,
						resource: { buffer: cellStateStorage[0] }
					}
				]
			})
		];

		const bindGroup = device.createBindGroup({
			label: 'Cell renderer bind group',
			layout: cellPipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: { buffer: uniformBuffer }
				}
			]
		});

		// Move all of our rendering code into a function
		function updateGrid() {
			const encoder = device.createCommandEncoder();

			const computePass = encoder.beginComputePass();

			computePass.setPipeline(simulationPipeline);
			computePass.setBindGroup(0, bindGroups[step % 2]);

			const workgroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);
			computePass.dispatchWorkgroups(workgroupCount, workgroupCount);

			computePass.end();

			step++; // Increment the step count

			// Start a render pass
			const pass = encoder.beginRenderPass({
				colorAttachments: [
					{
						view: context.getCurrentTexture().createView(),
						loadOp: 'clear',
						clearValue: { r: 0, g: 0, b: 0.4, a: 1.0 },
						storeOp: 'store'
					}
				]
			});

			// Draw the grid.
			pass.setPipeline(cellPipeline);
			pass.setBindGroup(0, bindGroups[step % 2]); // Updated!
			pass.setVertexBuffer(0, vertexBuffer);
			pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);

			// End the render pass and submit the command buffer
			pass.end();
			device.queue.submit([encoder.finish()]);
		}

		setInterval(updateGrid, UPDATE_INTERVAL);
	});
</script>

<canvas width="300" height="300" bind:this={canvasEl} />
