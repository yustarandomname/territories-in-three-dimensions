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

		const pipeline = device.createComputePipeline({
			label: 'doubling compute pipeline',
			layout: 'auto',
			compute: {
				module,
				entryPoint: 'update_graffiti_and_push_strength'
			}
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

		// Setup a bindGroup to tell the shader which
		// buffer to use for the computation
		const bindGroup = device.createBindGroup({
			label: 'bindGroup for work buffer',
			layout: pipeline.getBindGroupLayout(0),
			entries: [{ binding: 0, resource: { buffer: workBuffer } }]
		});

		// Encode commands to do the computation
		const encoder = device.createCommandEncoder({
			label: 'doubling encoder'
		});
		const pass = encoder.beginComputePass({
			label: 'doubling compute pass'
		});
		pass.setPipeline(pipeline);
		pass.setBindGroup(0, bindGroup);
		pass.dispatchWorkgroups(SIZE / 10, 1, 1);
		pass.end();

		// Encode a command to copy the results to a mappable buffer.
		encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);

		// Finish encoding and submit the commands
		const commandBuffer = encoder.finish();
		device.queue.submit([commandBuffer]);

		// Read the results
		await resultBuffer.mapAsync(GPUMapMode.READ);
		const result = new Float32Array(resultBuffer.getMappedRange().slice(0));
		resultBuffer.unmap();

		outputUniverse = Universe.from_result(result, SIZE);

		// inputArray = Array.from(result);
		// outputArray = Array.from(result);

		// console.log('input', input);
		// console.log('result', result);
		// console.log(nodeOutputArray);
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
