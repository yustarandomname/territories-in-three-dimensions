<script lang="ts">
	import { mdiArchive, mdiChartLine, mdiImage, mdiPlus, mdiTrashCan } from '@mdi/js';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Universe } from '../../Universe';
	import Canvas from '../../compute/Canvas.svelte';
	import Button from '../components/Button.svelte';
	import Sheet from '../components/Sheet.svelte';
	import SortableList from '../components/SortableList.svelte';
	import TabItem from '../components/TabItem.svelte';
	import Window from '../components/Window.svelte';
	import Input from '../components/Input.svelte';
	import { gpuStore, isCompleteGpuStore, isLoading } from '../gpuStore';
	import Ornament from './Ornament.svelte';
	import DarkToggle from '../components/DarkToggle.svelte';

	let autoPlayPanel = false;
	let iterateStep = 1000;
	let iterateAutoStep = 10000;
	let total_agents = 6250000;
	let sliceIndex = 0;
	let autoPlaySteps: { id: string; steps: number }[] = [
		{ id: 'a', steps: 100 },
		{ id: 'b', steps: 400 },
		{ id: 'c', steps: 1000 }
	];

	let inputUniverse = new Universe(50, total_agents, 3);
	let outputUniverse: Universe;

	$: iterations = (isCompleteGpuStore($gpuStore) ? $gpuStore?.hyperparameters?.iterations : 0) || 0;

	const HYPERPARAMS = {
		lambda: 0.5,
		gamma: 0.5,
		beta: (4 / 3) * 1e-5,
		size: inputUniverse.size,
		iterations: 0,
		total_agents: total_agents
	};

	function removePlayId(id: string) {
		autoPlaySteps = autoPlaySteps.filter((step) => step.id !== id);
	}

	function addPlayId() {
		autoPlaySteps = [...autoPlaySteps, { id: Math.random().toString(), steps: iterateAutoStep }];
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

		if (!resultArrays) return;

		outputUniverse = Universe.from_result(resultArrays.result, HYPERPARAMS.size, 3);
	}

	async function iterate() {
		if (!isCompleteGpuStore($gpuStore)) return;
		const resultArrays = await gpuStore.iterate(iterateStep);

		if (!resultArrays) return;
		outputUniverse = Universe.from_result(resultArrays.result, HYPERPARAMS.size, 3);
	}

	onMount(async () => {
		await reset();
	});
</script>

{#if $isLoading.loading}
	<div
		transition:fly={{ y: -10 }}
		class="absolute top-12 bg-slate-500/80 px-4 py-6 backdrop:blur-lg rounded-lg"
	>
		{$isLoading.message}
	</div>
{/if}

<Window title="Iterations: {iterations}" showSheet={autoPlayPanel} on:saveSettings={reset}>
	{#if !outputUniverse}
		<img alt="rendered version after n iterations" class="h-full w-full" src="/result.png" />
	{:else}
		<Canvas universe={outputUniverse} offset={sliceIndex * (HYPERPARAMS.size * HYPERPARAMS.size)} />
	{/if}

	<button
		slot="topTrailing"
		class="rounded-full py-2 px-3 hover:bg-gray-300/70 hover:scale-105 bg-gray-400/50 transition-all backdrop-blur-lg"
		class:selected={autoPlayPanel}
		on:click={() => (autoPlayPanel = !autoPlayPanel)}
	>
		Autoplay
	</button>

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
				<Input label="Gamma" input={HYPERPARAMS.gamma.toString()} bind:value={HYPERPARAMS.gamma} />
				<Input
					label="Lambda"
					input={HYPERPARAMS.lambda.toString()}
					bind:value={HYPERPARAMS.lambda}
				/>
				<Input label="Seed" input={HYPERPARAMS.lambda.toString()} bind:value={HYPERPARAMS.lambda} />
			</div>
		{:else if selectedTab == 'Agents'}
			<div class="flex flex-wrap gap-4">
				<Input label="Species" input="2" value={2} />
				<div class="flex items-center">
					<Input
						label="Agents / species"
						input={HYPERPARAMS.total_agents.toString()}
						bind:value={HYPERPARAMS.total_agents}
					/>
					<p class="ml-2">{HYPERPARAMS.total_agents / HYPERPARAMS.size ** 3} per cell</p>
				</div>
			</div>
		{:else}
			<DarkToggle />
		{/if}
	</div>

	<svelte:fragment slot="tabGroup">
		<TabItem selected icon={mdiImage} tooltip="Image" />
		<TabItem disabled icon={mdiChartLine} tooltip="Charts" />
		<TabItem disabled icon={mdiArchive} tooltip="Archive" />
	</svelte:fragment>

	<svelte:fragment slot="sheet">
		<Sheet title="Autoplay" on:close={() => (autoPlayPanel = false)}>
			<ol class="sortableList">
				<SortableList
					list={autoPlaySteps}
					key="id"
					on:sort={(ev) => (autoPlaySteps = ev.detail)}
					let:item
				>
					{item.steps}
					<Button icon={mdiTrashCan} on:click={() => removePlayId(item.id)} />
				</SortableList>
			</ol>

			<div class="w-full">
				<input
					type="number"
					class="bg-transparent outline-none rounded text-center hover:bg-gray-200/20 active:bg-gray-200/20 w-16"
					bind:value={iterateAutoStep}
				/>

				<Button icon={mdiPlus} on:click={addPlayId} />
			</div>

			<Button icon={mdiPlus}>Play all</Button>
		</Sheet>
	</svelte:fragment>
</Window>

<style lang="postcss">
	.sortableList :global(li) {
		@apply list-decimal flex justify-between items-center gap-2 p-2 rounded-md bg-white/50 mt-1;
	}

	button.selected {
		@apply bg-white/90 text-black;
	}
</style>
