<script lang="ts">
	import { onMount } from 'svelte';
	import computeShader from './computeShader.wgsl?raw';
	import { Universe } from './Universe';

	let inputUniverse = new Universe(100, 10000);
	let outputUniverse: Universe;

	const HYPERPARAMS = {
		lambda: 0.5,
		gamma: 0.5,
		beta: 0.1,
		size: 10,
		iterations: 0
	};

	function iterate() {
		inputUniverse = outputUniverse.clone();
		main();
	}

	async function main() {
		const adapter = await navigator.gpu?.requestAdapter();
		const device = await adapter?.requestDevice();
		if (!device) {
			console.log('need a browser that supports WebGPU');
			return;
		}

		const module = device.createShaderModule({
			label: 'doubling compute module',
			code: computeShader
		});

		const input = inputUniverse.to_f32_buffer();

		// Create a uniform buffer that describes the grid hyper paramets.
		const uniformArray = new Float32Array([
			HYPERPARAMS.lambda,
			HYPERPARAMS.gamma,
			HYPERPARAMS.beta,
			HYPERPARAMS.size,
			HYPERPARAMS.iterations
		]);
		const uniformBuffer = device.createBuffer({
			label: 'Grid Uniforms',
			size: uniformArray.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});
		device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

		// create a buffer on the GPU to hold our computation input as ping pong buffers
		const cellStateStorage = [
			device.createBuffer({
				label: 'Cell State A',
				size: input.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
			}),
			device.createBuffer({
				label: 'Cell State B',
				size: input.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
			})
		];

		// Copy our input data to that the first buffer
		device.queue.writeBuffer(cellStateStorage[0], 0, input);

		const agentsOutArray = new Float32Array(input.length * 4);
		// Create a buffer for storing the amount of agents moving out
		const agentsOutBuffers = [
			device.createBuffer({
				label: 'Agents Out red',
				size: agentsOutArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST //TODO: remove COPY src
			}),
			device.createBuffer({
				label: 'Agents Out blue',
				size: agentsOutArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST //TODO: remove COPY src
			})
		];
		device.queue.writeBuffer(agentsOutBuffers[0], 0, agentsOutArray);
		device.queue.writeBuffer(agentsOutBuffers[1], 0, new Float32Array(input.length * 4));

		// create a buffer on the GPU to get a copy of the results
		const resultBuffer = device.createBuffer({
			label: 'result buffer',
			size: input.byteLength,
			usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
		});

		const encoder = device.createCommandEncoder();

		const bindGroupLayout = device.createBindGroupLayout({
			label: 'Cell Bind Group Layout',
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {} // Grid uniform buffer
				},
				{
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'read-only-storage' } // Cell state input buffer
				},
				{
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'storage' } // Cell state output buffer
				},
				{
					binding: 3,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'storage' } // Cell state output buffer
				},
				{
					binding: 4,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'storage' } // Cell state output buffer
				}
			]
		});

		const pipelineLayout = device.createPipelineLayout({
			label: 'Cell Pipeline Layout',
			bindGroupLayouts: [bindGroupLayout]
		});

		function updateGraffitiAndPushStength(device: GPUDevice) {
			const updateGraffitiPipeline = device.createComputePipeline({
				label: 'update graffiti and push strength pipeline',
				layout: pipelineLayout,
				compute: {
					module,
					entryPoint: 'update_graffiti_and_push_strength'
				}
			});

			// Setup a bindGroup to tell the shader which
			// buffer to use for the computation
			const updateGraffitiBindGroup = device.createBindGroup({
				label: 'bindGroup for updating graffiti buffer',
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
					},
					{
						binding: 3,
						resource: { buffer: agentsOutBuffers[0] }
					},
					{
						binding: 4,
						resource: { buffer: agentsOutBuffers[1] }
					}
				] // TODO: make this ping pong buffers
			});

			// TODO: move to separate process: iterative process
			const pass = encoder.beginComputePass();
			pass.setPipeline(updateGraffitiPipeline);
			pass.setBindGroup(0, updateGraffitiBindGroup);
			pass.dispatchWorkgroups((HYPERPARAMS.size * HYPERPARAMS.size) / 10, 1, 1); // TODO: math.ceil
			pass.end();
		}

		function move_agents_out(device: GPUDevice) {
			const moveAgentsOutPipeline = device.createComputePipeline({
				label: 'moving agents compute pipeline',
				layout: pipelineLayout,
				compute: {
					module,
					entryPoint: 'move_agents_out'
				}
			});

			// Setup a bindGroup to tell the shader which
			// buffer to use for the computation
			const bindGroupMoveAgents = device.createBindGroup({
				label: 'bindGroup for moveing agents buffer',
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
					},
					{
						binding: 3,
						resource: { buffer: agentsOutBuffers[0] }
					},
					{
						binding: 4,
						resource: { buffer: agentsOutBuffers[1] }
					}
				] // TODO: make this ping pong buffers
			});

			// TODO: move to separate process: iterative process
			const pass = encoder.beginComputePass();
			pass.setPipeline(moveAgentsOutPipeline);
			pass.setBindGroup(0, bindGroupMoveAgents);
			pass.dispatchWorkgroups((HYPERPARAMS.size * HYPERPARAMS.size) / 10, 1, 1); // TODO: math.ceil
			pass.end();
		}

		function move_agents_in(device: GPUDevice) {
			const moveAgentsInPipeline = device.createComputePipeline({
				label: 'moving agents in compute pipeline',
				layout: pipelineLayout,
				compute: {
					module,
					entryPoint: 'move_agents_in'
				}
			});

			// Setup a bindGroup to tell the shader which
			// buffer to use for the computation
			const bindGroupMoveAgentsIn = device.createBindGroup({
				label: 'bindGroup for moving agents in buffer',
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
					},
					{
						binding: 3,
						resource: { buffer: agentsOutBuffers[0] }
					},
					{
						binding: 4,
						resource: { buffer: agentsOutBuffers[1] }
					}
				] // TODO: make this ping pong buffers
			});

			// TODO: move to separate process: iterative process
			const pass = encoder.beginComputePass();
			pass.setPipeline(moveAgentsInPipeline);
			pass.setBindGroup(0, bindGroupMoveAgentsIn);
			pass.dispatchWorkgroups((HYPERPARAMS.size * HYPERPARAMS.size) / 10, 1, 1); // TODO: math.ceil
			pass.end();
		}

		updateGraffitiAndPushStength(device);
		move_agents_out(device);
		move_agents_in(device);

		// Encode a command to copy the results to a mappable buffer.
		encoder.copyBufferToBuffer(cellStateStorage[1], 0, resultBuffer, 0, resultBuffer.size);

		// Finish encoding and submit the commands
		device.queue.submit([encoder.finish()]);

		// Read the results
		await resultBuffer.mapAsync(GPUMapMode.READ);
		const result = new Float32Array(resultBuffer.getMappedRange().slice(0));
		resultBuffer.unmap();

		// Output the results
		outputUniverse = Universe.from_result(result, HYPERPARAMS.size);
	}

	onMount(() => {
		main();
	});
</script>

<h1>Input</h1>
<pre>{JSON.stringify(inputUniverse)}</pre>

<button on:click={iterate}>iterate + 1</button>

<h1>Results</h1>
{#if outputUniverse}
	<p>
		avg: {outputUniverse.nodes.reduce((acc, node) => acc + node.red_agents, 0) /
			outputUniverse.nodes.length}
	</p>

	<p>
		total red agents: {outputUniverse.nodes.reduce((acc, node) => acc + node.red_agents, 0)}
	</p>

	<p>
		total blue agents: {outputUniverse.nodes.reduce((acc, node) => acc + node.blue_agents, 0)}
	</p>
{/if}

<pre>{JSON.stringify(outputUniverse, null, 2)}</pre>
