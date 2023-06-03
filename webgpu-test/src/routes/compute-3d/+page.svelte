<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { Universe } from '../Universe';
	import computeShader from './computeShader3d.wgsl?raw';
	import Canvas from '../compute/Canvas.svelte';
	// import Canvas from './Canvas.svelte';

	let inputUniverse = new Universe(50, 10000000, 3);
	let outputUniverse: Universe;
	let probe: boolean = true;
	let isPlaying = writable<boolean>(false);
	let playInterval: number | undefined;

	let iterateFunction: (() => Promise<void>) | undefined;

	const HYPERPARAMS = {
		lambda: 0.5,
		gamma: 0.5,
		beta: 1e-2,
		size: inputUniverse.size,
		iterations: 0
	};

	function iterate() {
		inputUniverse = outputUniverse.clone();
		main();
	}

	async function main() {
		const adapter = await navigator.gpu?.requestAdapter({ powerPreference: 'high-performance' });
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
		] as const;

		// Copy our input data to that the first buffer
		device.queue.writeBuffer(cellStateStorage[0], 0, input);

		const agentsOutArray = new Float32Array(input.length * 6);
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
		device.queue.writeBuffer(agentsOutBuffers[1], 0, new Float32Array(input.length * 6));

		// create a buffer on the GPU to get a copy of the results
		const resultBuffer = device.createBuffer({
			label: 'result buffer',
			size: input.byteLength,
			usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
		});

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

		async function iterate() {
			if (!device) return;

			const encoder = device.createCommandEncoder();

			const dispatchWorkgroups = Math.ceil(Math.pow(HYPERPARAMS.size, 3) / 10);

			{
				// Update graffiti and push strength
				const pass = encoder.beginComputePass();
				pass.setPipeline(updateGraffitiPipeline);
				pass.setBindGroup(0, updateBindGroups[HYPERPARAMS.iterations % 2]);
				pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1); // TODO: math.ceil
				pass.end();
			}
			{
				// Move agents out
				const pass = encoder.beginComputePass();
				pass.setPipeline(moveAgentsOutPipeline);
				pass.setBindGroup(0, moveOutBindGroups[HYPERPARAMS.iterations % 2]);
				pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1); // TODO: math.ceil
				pass.end();
			}
			{
				// Move agents in
				const pass = encoder.beginComputePass();
				pass.setPipeline(moveAgentsInPipeline);
				pass.setBindGroup(0, moveInBindGroups[HYPERPARAMS.iterations % 2]);
				pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1); // TODO: math.ceil
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
			}

			HYPERPARAMS.iterations++;

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
				probe = false;
			}
		}

		return iterate;
	}

	function togglePlay() {
		console.log('togglePlay');
		if (!$isPlaying && iterateFunction) {
			playInterval = setInterval(iterateFunction, 10);
			return isPlaying.set(true);
		}

		clearInterval(playInterval);
		return isPlaying.set(false);
	}

	onMount(async () => {
		iterateFunction = await main();
		iterateFunction?.();
		// draw();
	});
</script>

<h1>Input</h1>
<!-- <pre>{JSON.stringify(inputUniverse)}</pre> -->

<button on:click={iterate}>iterate + 1</button>

<h1>Results | iterations: {HYPERPARAMS.iterations}</h1>
{#if iterateFunction}
	<button
		on:click={() => {
			probe = true;
			iterateFunction?.();
		}}
		>Probe output
	</button>
	<button
		on:click={() => {
			let do_iterations = 1000;
			console.time(`Time to iterate: ${do_iterations}`);
			for (let i = 0; i < do_iterations; i++) {
				iterateFunction?.();
			}
			console.timeEnd(`Time to iterate: ${do_iterations}`);
		}}
		>Step
	</button>
	<button on:click={togglePlay}>
		Toggle play | {$isPlaying ? 'now playing' : 'paused'}
	</button>
{/if}

{#if outputUniverse}
	<p>
		total red agents: {outputUniverse.nodes.reduce((acc, node) => acc + node.red_agents, 0)}
	</p>

	<Canvas universe={outputUniverse} />
{/if}
