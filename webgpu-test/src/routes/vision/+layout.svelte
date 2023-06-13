<script lang="ts">
	import { mdiArchive, mdiChartLine, mdiCube, mdiImage } from '@mdi/js';
	import { onMount, setContext } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { LayoutData } from './$types';
	import { Universe } from './../Universe';
	import Ornament from './Ornament.svelte';
	import DarkToggle from './components/DarkToggle.svelte';
	import Input from './components/Input.svelte';
	import TabItem from './components/TabItem.svelte';
	import Window from './components/Window.svelte';
	import { HyperParameters, gpuStore, hasError, isCompleteGpuStore, isLoading } from './gpuStore';
	import { layoutData } from './layoutData';
	import { settingStore } from './settingStore';
	import Button from './components/Button.svelte';
	import Toggle from './components/Toggle.svelte';
	import JSConfetti from 'js-confetti';

	export let data: LayoutData;

	export const HYPERPARAMS = HyperParameters.fromObject({
		lambda: 0.5,
		gamma: 0.5,
		beta: (4 / 3) * 1e-5,
		size: 50,
		iterations: 0,
		total_agents: 6250000,
		seed: 123
	});

	let confettiEl: HTMLCanvasElement | undefined;
	let jsConfetti: JSConfetti;

	let iterateStep = 1000;
	let sliceIndex = 0;

	let inputUniverse = new Universe(HYPERPARAMS.size, HYPERPARAMS.total_agents, 3, HYPERPARAMS.seed);
	let outputUniverse: Universe;

	let tabs = [
		{ name: '2D Slice', icon: mdiImage, url: 'slice' },
		{ name: '3D view', icon: mdiCube, url: '3d' },
		{ name: 'Charts', icon: mdiChartLine, url: 'charts' },
		{ name: 'Archive', icon: mdiArchive, url: 'archive' }
	];

	let agentsPerCell = HYPERPARAMS.total_agents / Math.pow(HYPERPARAMS.size, 3);
	$: HYPERPARAMS.total_agents = agentsPerCell * Math.pow(HYPERPARAMS.size, 3);

	setContext('layoutData', layoutData);
	$: layoutData.HYPERPARAMS.set(HYPERPARAMS);
	$: layoutData.sliceIndex.set(sliceIndex);
	$: layoutData.iterateStep.set(iterateStep);

	$: iterations = (isCompleteGpuStore($gpuStore) ? $gpuStore?.hyperparameters?.iterations : 0) || 0;

	type ResultArrays = { result: Float32Array; orderResult: Float32Array };

	function handleResultArray(resultArrays: ResultArrays | undefined) {
		if (!resultArrays) return;

		outputUniverse = Universe.from_result(
			resultArrays.result,
			HYPERPARAMS.size,
			3,
			HYPERPARAMS.seed
		);
		layoutData.outputUniverse.set(outputUniverse);

		layoutData.orderParams.update((array) => {
			// Sum of all order parameters for all cells
			const result = [...resultArrays.orderResult].reduce((acc, val) => acc + val, 0);

			return [...array, { iter: iterations, result }];
		});
	}
	setContext('handleResultArray', handleResultArray);

	async function reset() {
		gpuStore.reset();
		HYPERPARAMS.iterations = 0;

		if (inputUniverse.isChanged(HYPERPARAMS)) {
			console.log('universe is changed, creating new universe');
			inputUniverse = new Universe(HYPERPARAMS.size, HYPERPARAMS.total_agents, 3, HYPERPARAMS.seed);
		}

		await gpuStore.init();

		const universeArray = new Float32Array(inputUniverse.to_f32_buffer());
		await gpuStore.setup(HYPERPARAMS, universeArray);

		if (!isCompleteGpuStore($gpuStore)) return;
		const resultArrays = await gpuStore.iterate(1);

		layoutData.orderParams.set([]);
		handleResultArray(resultArrays);
	}
	setContext('resetFn', reset);

	async function iterate() {
		if (!isCompleteGpuStore($gpuStore)) return;
		const resultArrays = await gpuStore.iterate(iterateStep);

		handleResultArray(resultArrays);
	}

	function playConfettti() {
		jsConfetti.addConfetti();

		setTimeout(() => {
			jsConfetti.addConfetti();
		}, 3000);

		setTimeout(() => {
			jsConfetti.addConfetti();
		}, 3000);

		var audio = new Audio('/trumpets.mp3');
		audio.play();
	}

	setContext('playConfettti', playConfettti);

	onMount(async () => {
		settingStore.setup();

		await reset();

		if (confettiEl) {
			jsConfetti = new JSConfetti({ canvas: confettiEl });
		}
	});
</script>

{#if $hasError.hasError}
	<div
		transition:fly={{ y: -10 }}
		style="z-index: 100"
		class="absolute left-1/2 -translate-x-1/2 w-60 text-center top-12 bg-red-300/80 px-4 py-6 backdrop:blur-lg rounded-lg"
	>
		{$hasError.message || 'error'}
	</div>
{:else if $isLoading.loading}
	<div
		transition:fly={{ y: -10 }}
		style="z-index: 100"
		class="absolute left-1/2 -translate-x-1/2 w-60 text-center top-12 bg-slate-300/80 px-4 py-6 backdrop:blur-lg rounded-lg"
	>
		{$isLoading.message}
	</div>
{/if}

<!-- Confetti -->
<canvas bind:this={confettiEl} class="absolute top-0 left-0 h-full w-full bg-red" />

<div
	class="background h-full w-full text-white flex justify-center items-center"
	class:dark={$settingStore.darkMode == 'dark'}
	class:auto={$settingStore.darkMode == 'auto'}
>
	{#if !$hasError.hasError}
		<Window path={data.path} title="Iterations: {iterations}" on:saveSettings={reset}>
			<slot />

			<svelte:fragment slot="ornament">
				<Ornament bind:iterateStep bind:sliceIndex on:iterate={iterate} on:reset={reset} />
			</svelte:fragment>

			<div slot="ornamentExpand" let:selectedTab>
				{#if selectedTab == 'Parameters'}
					<div class="flex flex-wrap gap-4">
						<Input
							label="Beta"
							input={HYPERPARAMS.beta.toExponential()}
							bind:value={HYPERPARAMS.beta}
						/>
						<Input
							label="Gamma"
							input={HYPERPARAMS.gamma.toString()}
							bind:value={HYPERPARAMS.gamma}
						/>
						<Input
							label="Lambda"
							input={HYPERPARAMS.lambda.toString()}
							bind:value={HYPERPARAMS.lambda}
						/>
						<Input label="Seed" input={HYPERPARAMS.seed.toString()} bind:value={HYPERPARAMS.seed} />
					</div>
				{:else if selectedTab == 'Universe'}
					<div class="flex flex-wrap gap-4">
						<Input
							label="Lattice length"
							input={HYPERPARAMS.size.toString()}
							bind:value={HYPERPARAMS.size}
						/>
						<div class="flex items-center gap-2">
							<Input
								label="Agents / species"
								input={HYPERPARAMS.total_agents.toString()}
								bind:value={HYPERPARAMS.total_agents}
							/>
							<Input label="per cell" input={agentsPerCell.toString()} bind:value={agentsPerCell} />
						</div>
					</div>
				{:else}
					<DarkToggle />
					<Toggle title="Order scale" key="orderScale" options={['linear', 'logarithmic']} />
					<Toggle title="Density type" key="densityType" options={['relative', 'absolute']} />
					<div class="flex items-center gap-4 mt-2">
						<p>Reset:</p>
						<Button selected on:click={() => settingStore.reset()}>Reset settings</Button>
					</div>
				{/if}
			</div>

			<svelte:fragment slot="tabGroup">
				{#each tabs as tab}
					<TabItem
						selected={data.path == tab.url}
						href="/vision/{tab.url}"
						icon={tab.icon}
						tooltip={tab.name}
					/>
				{/each}
			</svelte:fragment>
		</Window>
	{/if}
</div>

<style lang="postcss">
	.background {
		transition: all 2s;
	}

	.background::after {
		content: '';
		position: absolute;
		z-index: -2;
		@apply h-full w-full bg-gradient-to-br to-slate-800 from-cyan-800;
	}

	.background::before {
		content: '';
		position: absolute;
		z-index: -1;
		opacity: 1;
		transition: opacity 2s;
		@apply h-full w-full bg-gradient-to-br from-orange-100 to-orange-300;
	}

	.dark.background::before {
		opacity: 0;
	}

	:global(body) {
		@apply bg-orange-200;

		&:has(.dark) {
			@apply bg-slate-800;
		}
	}

	@media (prefers-color-scheme: dark) {
		.auto.background::before {
			opacity: 0;
		}

		:global(body):has(auto) {
			@apply bg-slate-800;
		}
	}
</style>
