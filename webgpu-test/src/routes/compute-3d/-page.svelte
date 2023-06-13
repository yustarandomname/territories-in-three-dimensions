<script lang="ts">
	import { onMount } from 'svelte';
	import { Universe } from '../Universe';
	import computeShader from './computeShader3d.wgsl?raw';
	import Canvas from '../compute/Canvas.svelte';
	import AgentDensityPlot from './AgentDensityPlot.svelte';
	import OrderParamsPlot from './OrderParamsPlot.svelte';

	let total_agents = 6250000;
	let beta_input = '(4/3) * 1e-5';
	let beta_input_error = '';

	let inputUniverse = new Universe(50, total_agents, 3);
	let outputUniverse: Universe;
	let probe: boolean = true;
	let do_iterations = 1000;
	let sliceIndex = 0;
	let error: string | undefined;

	let orderParams: { x: number; y: number }[] = [];

	let iterateFunction: (() => Promise<void>) | undefined;

	const HYPERPARAMS = {
		lambda: 0.5,
		gamma: 0.5,
		beta: eval(beta_input),
		size: inputUniverse.size,
		iterations: 0,
		total_agents: total_agents
	};

	async function main() {
		const adapter = await navigator.gpu?.requestAdapter({ powerPreference: 'high-performance' });
		const device = await adapter?.requestDevice();
		if (!device) {
			console.log('need a browser that supports WebGPU');
			error = 'need a browser that supports WebGPU this demo only works in Chrome version 114+ ';
			return;
		}

		const module = device.createShaderModule({
			label: 'compute module',
			code: computeShader
		});

		const input = inputUniverse.to_f32_buffer();

		// Create a uniform buffer that describes the grid hyper paramets.
		const uniformArray = new Float32Array([
			HYPERPARAMS.lambda,
			HYPERPARAMS.gamma,
			HYPERPARAMS.beta,
			HYPERPARAMS.size,
			HYPERPARAMS.iterations,
			HYPERPARAMS.total_agents
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
		] as const;

		// Copy our input data to that the first buffer
		device.queue.writeBuffer(cellStateStorage[0], 0, input);

		const agentsOutArray = new Float32Array(input.length * 6);
		// Create a buffer for storing the amount of agents moving out
		const agentsOutBuffers = [
			device.createBuffer({
				label: 'Agents Out red',
				size: agentsOutArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			}),
			device.createBuffer({
				label: 'Agents Out blue',
				size: agentsOutArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			})
		];
		device.queue.writeBuffer(agentsOutBuffers[0], 0, agentsOutArray);
		device.queue.writeBuffer(agentsOutBuffers[1], 0, new Float32Array(input.length * 6));

		// create a buffer on the GPU to get a copy of the results
		const resultBuffer = device.createBuffer({
			label: 'result buffer',
			size: input.byteLength,
			usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
		});

		// create a buffer on the GPU to get the current order parameter
		const orderBuffer = device.createBuffer({
			label: 'order buffer',
			size: Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
		});

		const orderResultBuffer = device.createBuffer({
			label: 'result buffer',
			size: Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
		});

		const bindGroupLayout = device.createBindGroupLayout({
			label: 'Cell Bind Group Layout',
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'uniform' } // Grid uniform buffer
				},
				{
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'read-only-storage' } // Cell state input buffer
				},
				{
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'storage' } // Cell red agent neighbours buffer
				},
				{
					binding: 3,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'storage' } // Cell blue agent neighbours buffer
				},
				{
					binding: 4,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'storage' } // Cell state output buffer
				},
				{
					binding: 5,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: 'storage' } // Cell state order parameter buffer
				}
			]
		});

		function createPipeline(entryPoint: string, device: GPUDevice) {
			const pipelineLayout = device.createPipelineLayout({
				label: 'Cell Pipeline Layout',
				bindGroupLayouts: [bindGroupLayout]
			});

			const computePipeline = device.createComputePipeline({
				label: `${entryPoint} pipeline`,
				layout: pipelineLayout,
				compute: {
					module,
					entryPoint
				}
			});

			// Setup a bindGroup to tell the shader which buffer to use for the computation
			// For each iterations we need to swap the input and output buffers
			const bindGroups = [
				device.createBindGroup({
					label: `BindGroup for ${entryPoint}, iteration ${HYPERPARAMS.iterations}, group A`,
					layout: bindGroupLayout,
					entries: [
						{
							binding: 0,
							resource: { buffer: uniformBuffer }
						},
						{
							binding: 1,
							resource: { buffer: cellStateStorage[0] } // Cell state A buffer
						},
						{
							binding: 2,
							resource: { buffer: cellStateStorage[1] } // Cell state B buffer
						},
						{
							binding: 3,
							resource: { buffer: agentsOutBuffers[0] }
						},
						{
							binding: 4,
							resource: { buffer: agentsOutBuffers[1] }
						},
						{
							binding: 5,
							resource: { buffer: orderBuffer }
						}
					]
				}),
				device.createBindGroup({
					label: `BindGroup for ${entryPoint}, iteration ${HYPERPARAMS.iterations}, group A`,
					layout: bindGroupLayout,
					entries: [
						{
							binding: 0,
							resource: { buffer: uniformBuffer }
						},
						{
							binding: 1,
							resource: { buffer: cellStateStorage[1] } // Cell state B buffer
						},
						{
							binding: 2,
							resource: { buffer: cellStateStorage[0] } // Cell state A buffer
						},
						{
							binding: 3,
							resource: { buffer: agentsOutBuffers[0] }
						},
						{
							binding: 4,
							resource: { buffer: agentsOutBuffers[1] }
						},
						{
							binding: 5,
							resource: { buffer: orderBuffer }
						}
					]
				})
			];

			return { computePipeline, bindGroups };
		}

		// Setup the pipeline for the update cell graffiti step
		const { computePipeline: updateGraffitiPipeline, bindGroups: updateBindGroups } =
			createPipeline('update_graffiti_and_push_strength', device);

		const { computePipeline: moveAgentsOutPipeline, bindGroups: moveOutBindGroups } =
			createPipeline('move_agents_out', device);

		const { computePipeline: moveAgentsInPipeline, bindGroups: moveInBindGroups } = createPipeline(
			'move_agents_in',
			device
		);
		const { computePipeline: orderParamPipeline, bindGroups: orderParamBindGroups } =
			createPipeline('calculate_order_param', device);

		async function iterate() {
			if (!device) return;

			const encoder = device.createCommandEncoder();

			const dispatchWorkgroups = Math.ceil(Math.pow(HYPERPARAMS.size, 3) / 100);

			{
				// Update graffiti and push strength
				const pass = encoder.beginComputePass();
				pass.setPipeline(updateGraffitiPipeline);
				pass.setBindGroup(0, updateBindGroups[HYPERPARAMS.iterations % 2]);
				pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

				pass.setPipeline(moveAgentsOutPipeline);
				pass.setBindGroup(0, moveOutBindGroups[HYPERPARAMS.iterations % 2]);
				pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

				pass.setPipeline(moveAgentsInPipeline);
				pass.setBindGroup(0, moveInBindGroups[HYPERPARAMS.iterations % 2]);
				pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

				// HYPERPARAMS.iterations++;
				// pass.setPipeline(orderParamPipeline);
				// pass.setBindGroup(0, orderParamBindGroups[HYPERPARAMS.iterations % 2]);
				// pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

				// pass.setPipeline(updateGraffitiPipeline);
				// pass.setBindGroup(0, updateBindGroups[HYPERPARAMS.iterations % 2]);
				// pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

				// pass.setPipeline(moveAgentsOutPipeline);
				// pass.setBindGroup(0, moveOutBindGroups[HYPERPARAMS.iterations % 2]);
				// pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

				// pass.setPipeline(moveAgentsInPipeline);
				// pass.setBindGroup(0, moveInBindGroups[HYPERPARAMS.iterations % 2]);
				// pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

				pass.setPipeline(orderParamPipeline);
				pass.setBindGroup(0, orderParamBindGroups[HYPERPARAMS.iterations % 2]);
				pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);
				HYPERPARAMS.iterations++;
				pass.end();
			}

			// Only show output if we are probing
			if (probe) {
				// Encode a command to copy the results to a mappable buffer.
				encoder.copyBufferToBuffer(
					cellStateStorage[(HYPERPARAMS.iterations + 1) % 2],
					0,
					resultBuffer,
					0,
					resultBuffer.size
				);
				encoder.copyBufferToBuffer(orderBuffer, 0, orderResultBuffer, 0, orderResultBuffer.size);
			}

			// Finish encoding and submit the commands
			device.queue.submit([encoder.finish()]);

			if (probe) {
				// Read results
				await resultBuffer.mapAsync(GPUMapMode.READ);
				const result = new Float32Array(resultBuffer.getMappedRange().slice(0));
				resultBuffer.unmap();

				// Output the results
				outputUniverse = Universe.from_result(result, HYPERPARAMS.size, 3);
				console.log('output', outputUniverse.nodes.slice(0, 10));

				await orderResultBuffer.mapAsync(GPUMapMode.READ);
				const orderResult = new Float32Array(orderResultBuffer.getMappedRange().slice(0));
				orderResultBuffer.unmap();

				orderParams = [...orderParams, { x: HYPERPARAMS.iterations, y: orderResult[0] }];
				probe = false;
			}
		}

		return iterate;
	}

	async function reset() {
		HYPERPARAMS.iterations = 0;
		probe = true;
		iterateFunction = await main();
		iterateFunction?.();
		orderParams = [];
	}

	onMount(reset);
</script>

<h1 class="text-2xl fixed bg-white/80 p-4 top-0 left-0 w-full">
	Results | iterations: {HYPERPARAMS.iterations}
</h1>
{#if iterateFunction}
	<p class="mt-12">
		Lambda: <code>{HYPERPARAMS.lambda}</code> | Gamma: <code>{HYPERPARAMS.gamma}</code>
		<label>
			<br />Beta:
			<input
				class="w-96"
				on:change={reset}
				on:keyup={() => {
					try {
						let value = eval(beta_input);
						if (value) {
							HYPERPARAMS.beta = value;
							beta_input_error = '';
						} else {
							HYPERPARAMS.beta = 0;
							beta_input_error = 'Invalid expression';
						}
					} catch (e) {
						beta_input_error = e?.message || 'Invalid expression';
					}
				}}
				bind:value={beta_input}
			/>
			= <code>{HYPERPARAMS.beta.toExponential()}</code>
		</label>
		{#if beta_input_error}
			<div class="text-red-500">Error: {beta_input_error}</div>
		{/if}
	</p>

	<button
		on:click={() => {
			console.time(`Time to probe`);
			probe = true;
			iterateFunction?.();
			console.timeEnd(`Time to probe`);
		}}
		>Probe output
	</button>

	<input bind:value={do_iterations} />
	<button
		on:click={() => {
			for (let i = 0; i < do_iterations; i++) {
				if (i == do_iterations - 1) {
					probe = true;
				}

				iterateFunction?.();
			}
		}}
		>Step
	</button>

	<button on:click={reset}>Reset</button>
{/if}

{#if error}
	<p class="absolute text-red-500">
		{error}
		<a href="chrome://settings/help" class="underline text-blue">
			go to chrome://settings/help to update
		</a>
	</p>
{/if}

{#if outputUniverse}
	<h3 class="my-2 text-xl">Metrics</h3>
	<p>Agents per species: <code>{total_agents}</code></p>
	<p>
		Agents per species per cell: <code>{total_agents / Math.pow(HYPERPARAMS.size, 3)}</code>
	</p>

	<label>
		Slice at z =
		<code class="inline-block w-4">{sliceIndex}</code>
		<input type="range" min="0" max={HYPERPARAMS.size - 2} bind:value={sliceIndex} />
	</label>

	<Canvas universe={outputUniverse} offset={sliceIndex * (HYPERPARAMS.size * HYPERPARAMS.size)} />

	{#key outputUniverse}
		<AgentDensityPlot nodes={outputUniverse.nodes.slice(0, HYPERPARAMS.size)} />
	{/key}

	{#key orderParams}
		<OrderParamsPlot {orderParams} />
	{/key}
{/if}

<style lang="postcss">
	code {
		@apply text-red-700;
	}
</style>
