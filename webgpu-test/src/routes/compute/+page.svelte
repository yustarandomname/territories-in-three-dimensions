<script lang="ts">
	import { onMount } from 'svelte';
	import setup2D, { type Pipeline, type OutputBuffers, type StorageBuffers } from './setup2d';
	import { Universe } from '../Universe';
	import { HyperParameters } from '../vision/gpuStore';
	import Canvas from './Canvas.svelte';
	import Input from '../vision/components/Input.svelte';
	import Button from '../vision/components/Button.svelte';

	type OrderParams = { iteration: number; orderParam: number }[];

	let device: GPUDevice;
	let pipelines: Pipeline | undefined;
	let outputBuffers: OutputBuffers;
	let storageBuffers: StorageBuffers;
	let error: string;
	let loading = true;
	let orderParams: OrderParams = [];
	const SEED = 12345;

	let total_agents = 500000;
	let do_iterations = 10000;

	let inputUniverse = new Universe(100, total_agents, 2, SEED);
	console.log(inputUniverse.total_size);
	let outputUniverse: Universe;

	const HYPERPARAMS = {
		lambda: 0.5,
		gamma: 0.5,
		beta: 5 * 1e-5,
		size: inputUniverse.size,
		iterations: 0,
		total_agents: total_agents,
		seed: SEED
	};

	async function reset() {
		HYPERPARAMS.iterations = 0;
		orderParams = [];

		const hyperparamsArray = new Float32Array([
			HYPERPARAMS.lambda,
			HYPERPARAMS.gamma,
			HYPERPARAMS.beta,
			HYPERPARAMS.size,
			HYPERPARAMS.iterations,
			HYPERPARAMS.total_agents,
			HYPERPARAMS.seed
		]);

		const universeArray = new Float32Array(inputUniverse.to_f32_buffer());

		const gpuSetup = await setup2D(
			device,
			{ hyperparamsArray, universeArray },
			HyperParameters.fromObject(HYPERPARAMS)
		);
		pipelines = gpuSetup.pipelines;
		storageBuffers = gpuSetup.storageBuffers;
		outputBuffers = gpuSetup.outputBuffers;
	}

	onMount(async () => {
		loading = true;

		const adapter = await navigator.gpu?.requestAdapter({ powerPreference: 'high-performance' });
		const gpuDevice = await adapter?.requestDevice();
		if (!gpuDevice) {
			console.log('need a browser that supports WebGPU');
			error = 'need a browser that supports WebGPU this demo only works in Chrome version 114+ ';
			return;
		}
		device = gpuDevice;

		await reset();

		error = '';
		loading = false;
	});

	async function iterate(amount: number) {
		if (!pipelines || loading || !device) return;
		loading = true;
		console.log(HYPERPARAMS);

		const encoder = device.createCommandEncoder();
		const dispatchWorkgroups = Math.ceil(Math.pow(HYPERPARAMS.size, 2) / 100); //TODO: make this hyperparam

		// Setup pipeline
		for (let i = 0; i < amount; i++) {
			const pass = encoder.beginComputePass();
			pass.setPipeline(pipelines['update_graffiti_and_push_strength'].pipeline);
			pass.setBindGroup(
				0,
				pipelines['update_graffiti_and_push_strength'].bindGroups[HYPERPARAMS.iterations % 2]
			);
			pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

			pass.setPipeline(pipelines['move_agents_out'].pipeline);
			pass.setBindGroup(0, pipelines['move_agents_out'].bindGroups[HYPERPARAMS.iterations % 2]);
			pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

			pass.setPipeline(pipelines['move_agents_in'].pipeline);
			pass.setBindGroup(0, pipelines['move_agents_in'].bindGroups[HYPERPARAMS.iterations % 2]);
			pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);
			HYPERPARAMS.iterations++;
			pass.end();
		}

		// Calculate order parameter
		const pass = encoder.beginComputePass();
		pass.setPipeline(pipelines['calculate_order_param'].pipeline);
		pass.setBindGroup(0, pipelines['calculate_order_param'].bindGroups[HYPERPARAMS.iterations % 2]);
		pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);
		pass.end();

		// Move storage buffers to result buffers
		encoder.copyBufferToBuffer(
			storageBuffers.cellStateStorage[(HYPERPARAMS.iterations + 1) % 2],
			0,
			outputBuffers.resultBuffer,
			0,
			outputBuffers.resultBuffer.size
		);
		encoder.copyBufferToBuffer(
			storageBuffers.orderBuffer,
			0,
			outputBuffers.orderResultBuffer,
			0,
			outputBuffers.orderResultBuffer.size
		);

		// Finish encoding and submit the commands
		device.queue.submit([encoder.finish()]);

		// Read results
		await outputBuffers.resultBuffer.mapAsync(GPUMapMode.READ);
		const result = new Float32Array(outputBuffers.resultBuffer.getMappedRange().slice(0));
		outputBuffers.resultBuffer.unmap();

		// // Output the results
		outputUniverse = Universe.from_result(result, HYPERPARAMS.size, 2, SEED);
		console.log('output', outputUniverse.nodes.slice(0, 10));

		console.log(
			'red_agents',
			outputUniverse.nodes.reduce((acc, val) => acc + val.red_agents, 0)
		);

		// console.time(`Time to read`);
		await outputBuffers.orderResultBuffer.mapAsync(GPUMapMode.READ);
		const orderResult = new Float32Array(outputBuffers.orderResultBuffer.getMappedRange().slice(0));
		outputBuffers.orderResultBuffer.unmap();

		const resultOrder = [...orderResult].reduce((acc, val) => acc + val, 0);
		// console.timeEnd(`Time to read`);

		orderParams = [...orderParams, { iteration: HYPERPARAMS.iterations, orderParam: resultOrder }];
		loading = false;
	}
</script>

<h1 class="text-3xl">Iterations run: {HYPERPARAMS.iterations}</h1>
{#if error}
	<p>Something went wrong: {error}</p>
	<!-- TODO: add reset button -->
{:else if loading}
	<p>We are loading</p>
{:else}
	<p>Nice we are loaded</p>
	<input type="number" bind:value={do_iterations} />
	<button
		on:click={async () => {
			console.time(`Time to iterate total: ${do_iterations}`);
			await iterate(do_iterations);
			console.timeEnd(`Time to iterate total: ${do_iterations}`);
		}}>iterate {do_iterations} times</button
	>

	<Input label="beta" input={HYPERPARAMS.beta.toExponential()} bind:value={HYPERPARAMS.beta} />
	<Button
		selected
		on:click={async () => {
			await reset();
			iterate(do_iterations);
		}}>Reset and iterate</Button
	>

	<p class="m-4">
		{JSON.stringify(orderParams)}
	</p>

	{#if outputUniverse}
		<Canvas universe={outputUniverse} />
	{/if}
{/if}
