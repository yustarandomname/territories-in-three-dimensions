<script lang="ts">
	import { mdiArchive, mdiChartLine, mdiImage } from '@mdi/js';
	import { onMount, setContext } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { LayoutData } from './$types';
	import { Universe } from './../Universe';
	import Ornament from './Ornament.svelte';
	import DarkToggle from './components/DarkToggle.svelte';
	import Input from './components/Input.svelte';
	import TabItem from './components/TabItem.svelte';
	import Window from './components/Window.svelte';
	import { gpuStore, hasError, isCompleteGpuStore, isLoading } from './gpuStore';
	import { layoutData } from './layoutData';
	import { settingStore } from './settingStore';
	import Button from './components/Button.svelte';

	export let data: LayoutData;

	let iterateStep = 1000;
	let total_agents = 6250000;
	let sliceIndex = 0;

	let inputUniverse = new Universe(50, total_agents, 3);
	let outputUniverse: Universe;

	let tabs = [
		{ name: 'Image', icon: mdiImage },
		{ name: 'Charts', icon: mdiChartLine },
		{ name: 'Archive', icon: mdiArchive }
	];

	export const HYPERPARAMS = {
		lambda: 0.5,
		gamma: 0.5,
		beta: (4 / 3) * 1e-5,
		size: inputUniverse.size,
		iterations: 0,
		total_agents: total_agents
	};

	setContext('layoutData', layoutData);
	$: layoutData.HYPERPARAMS.set(HYPERPARAMS);
	$: layoutData.sliceIndex.set(sliceIndex);
	$: layoutData.iterateStep.set(iterateStep);

	$: iterations = (isCompleteGpuStore($gpuStore) ? $gpuStore?.hyperparameters?.iterations : 0) || 0;

	type ResultArrays = { result: Float32Array; orderResult: Float32Array };

	function handleResultArray(resultArrays: ResultArrays | undefined) {
		if (!resultArrays) return;

		outputUniverse = Universe.from_result(resultArrays.result, HYPERPARAMS.size, 3);
		layoutData.outputUniverse.set(outputUniverse);

		layoutData.orderParams.update((array) => {
			// Sum of all order parameters for all cells
			const result = [...resultArrays.orderResult].reduce((acc, val) => acc + val, 0);

			return [...array, { iter: iterations, result }];
		});
	}

	async function reset() {
		gpuStore.reset();
		HYPERPARAMS.iterations = 0;

		if (HYPERPARAMS.total_agents != total_agents) {
			total_agents = HYPERPARAMS.total_agents;
			inputUniverse = new Universe(50, total_agents, 3);
		}

		await gpuStore.init();

		const universeArray = new Float32Array(inputUniverse.to_f32_buffer());
		await gpuStore.setup(HYPERPARAMS, universeArray);

		if (!isCompleteGpuStore($gpuStore)) return;
		const resultArrays = await gpuStore.iterate(1);

		layoutData.orderParams.set([]);
		handleResultArray(resultArrays);
	}

	async function iterate() {
		if (!isCompleteGpuStore($gpuStore)) return;
		const resultArrays = await gpuStore.iterate(iterateStep);

		handleResultArray(resultArrays);
	}

	onMount(async () => {
		settingStore.setup();

		await reset();
	});
</script>

{#if $hasError.hasError}
	<div
		transition:fly={{ y: -10 }}
		class="absolute left-1/2 -translate-x-1/2 w-60 text-center top-12 bg-red-300/80 px-4 py-6 backdrop:blur-lg rounded-lg"
	>
		{$hasError.message || 'error'}
	</div>
{:else if $isLoading.loading}
	<div
		transition:fly={{ y: -10 }}
		class="absolute left-1/2 -translate-x-1/2 w-60 text-center top-12 bg-slate-300/80 px-4 py-6 backdrop:blur-lg rounded-lg"
	>
		{$isLoading.message}
	</div>
{/if}

{#if $hasError.hasError}
	<div
		class="background h-full w-full text-white flex justify-center items-center"
		class:dark={$settingStore.darkMode == 'dark'}
	>
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
						<Input
							label="Seed"
							input={HYPERPARAMS.lambda.toString()}
							bind:value={HYPERPARAMS.lambda}
						/>
					</div>
				{:else if selectedTab == 'Agents'}
					<div class="flex flex-wrap gap-4">
						<div class="flex items-center gap-2">
							<Input label="Species" input="2" value={2} />
							<p>(Work in Progress)</p>
						</div>
						<div class="flex items-center gap-2">
							<Input
								label="Agents / species"
								input={HYPERPARAMS.total_agents.toString()}
								bind:value={HYPERPARAMS.total_agents}
							/>
							<p>{HYPERPARAMS.total_agents / HYPERPARAMS.size ** 3} per cell</p>
						</div>
					</div>
				{:else}
					<DarkToggle />
					<div class="flex items-center gap-4 mt-2">
						<p>Reset:</p>
						<Button selected on:click={() => settingStore.reset()}>Reset settings</Button>
					</div>
				{/if}
			</div>

			<svelte:fragment slot="tabGroup">
				{#each tabs as tab}
					<TabItem
						selected={data.path == tab.name.toLowerCase()}
						href="/vision/{tab.name.toLowerCase()}"
						icon={tab.icon}
						tooltip={tab.name}
					/>
				{/each}
			</svelte:fragment>
		</Window>
	</div>
{/if}

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

	@media (prefers-color-scheme: dark) {
		.background::before {
			opacity: 0;
		}
	}
</style>
