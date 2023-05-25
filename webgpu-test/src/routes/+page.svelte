<script lang="ts">
	import { onMount } from 'svelte';

	import shaderString from './shader.wgsl?raw';

	let canvasEl: HTMLCanvasElement;

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

	function createRenderPass(
		device: GPUDevice,
		context: GPUCanvasContext,
		passes: (pass: GPURenderPassEncoder) => void
	) {
		const encoder = device.createCommandEncoder();
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					loadOp: 'clear',
					clearValue: { r: 0, g: 0, b: 0.4, a: 1 }, // New line
					storeOp: 'store'
				}
			]
		});

		passes(pass);

		pass.end();
		device.queue.submit([encoder.finish()]);
	}

	onMount(async () => {
		const { device, canvasFormat, context } = await setupGPU();

		const GRID_SIZE = 32;

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

		const cellShaderModule = device.createShaderModule({
			label: 'Cell shader',
			code: shaderString
		});

		const cellPipeline = device.createRenderPipeline({
			label: 'Cell pipeline',
			layout: 'auto',
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

		createRenderPass(device, context, (pass) => {
			pass.setPipeline(cellPipeline);
			pass.setVertexBuffer(0, vertexBuffer);
			pass.setBindGroup(0, bindGroup);
			pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);
		});
	});
</script>

<canvas width="300" height="300" bind:this={canvasEl} />
