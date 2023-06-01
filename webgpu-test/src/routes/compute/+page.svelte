<script lang="ts">
	import { onMount } from 'svelte';
	import computeShader from './computeShader.wgsl?raw';
	import { Universe } from './Universe';

	class Node {
		constructor(
			public red_agents: number,
			public blue_agents: number,
			public red_graffiti: number,
			public blue_graffiti: number,
			public red_strength: number,
			public blue_strength: number
		) {}
	}

	let inputUniverse = new Universe(100, 10000);
	let outputUniverse: Universe;

	const SIZE = 100;

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

		// create a buffer on the GPU to hold our computation
		// input and output
		const workBuffer = device.createBuffer({
			label: 'work buffer',
			size: input.byteLength,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
		});
		// Copy our input data to that buffer
		device.queue.writeBuffer(workBuffer, 0, input);

		// create a buffer on the GPU to get a copy of the results
		const resultBuffer = device.createBuffer({
			label: 'result buffer',
			size: input.byteLength,
			usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
		});

		const encoder = device.createCommandEncoder();

		function updateGraffitiAndPushStength(device: GPUDevice) {
			const updateGraffitiPipeline = device.createComputePipeline({
				label: 'update graffiti and push strength pipeline',
				layout: 'auto',
				compute: {
					module,
					entryPoint: 'update_graffiti_and_push_strength'
				}
			});

			// Setup a bindGroup to tell the shader which
			// buffer to use for the computation
			const updateGraffitiBindGroup = device.createBindGroup({
				label: 'bindGroup for updating graffiti buffer',
				layout: updateGraffitiPipeline.getBindGroupLayout(0),
				entries: [{ binding: 0, resource: { buffer: workBuffer } }] // TODO: make this ping pong buffers
			});

			// TODO: move to separate process: iterative process
			const pass = encoder.beginComputePass();
			pass.setPipeline(updateGraffitiPipeline);
			pass.setBindGroup(0, updateGraffitiBindGroup);
			pass.dispatchWorkgroups(SIZE / 10, 1, 1);
			pass.end();
		}

		function move_agents(device: GPUDevice) {
			const moveAgentsOutPipeline = device.createComputePipeline({
				label: 'moving agents compute pipeline',
				layout: 'auto',
				compute: {
					module,
					entryPoint: 'move_agents'
				}
			});

			// Setup a bindGroup to tell the shader which
			// buffer to use for the computation
			const bindGroupMoveAgents = device.createBindGroup({
				label: 'bindGroup for work buffer',
				layout: moveAgentsOutPipeline.getBindGroupLayout(0),
				entries: [{ binding: 0, resource: { buffer: workBuffer } }] // TODO: make this ping pong buffers
			});

			// TODO: move to separate process: iterative process
			const pass = encoder.beginComputePass();
			pass.setPipeline(moveAgentsOutPipeline);
			pass.setBindGroup(0, bindGroupMoveAgents);
			pass.dispatchWorkgroups(SIZE / 10, 1, 1); // TODO: math.ceil
			pass.end();
		}

		updateGraffitiAndPushStength(device);
		move_agents(device);

		// Encode a command to copy the results to a mappable buffer.
		encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);

		// Finish encoding and submit the commands
		device.queue.submit([encoder.finish()]);

		// Read the results
		await resultBuffer.mapAsync(GPUMapMode.READ);
		const result = new Float32Array(resultBuffer.getMappedRange().slice(0));
		resultBuffer.unmap();

		// Output the results
		outputUniverse = Universe.from_result(result, SIZE);
	}

	onMount(() => {
		main();
	});
</script>

<h1>Input</h1>
<pre>{JSON.stringify(inputUniverse)}</pre>

<button on:click={iterate}>iterate + 1</button>

<h1>Results</h1>
<pre>{JSON.stringify(outputUniverse, null, 2)}</pre>
