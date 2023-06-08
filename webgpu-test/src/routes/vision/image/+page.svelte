<script lang="ts">
	import {
		mdiArchive,
		mdiChartLine,
		mdiCube,
		mdiDotsHorizontal,
		mdiExport,
		mdiImage,
		mdiPlus,
		mdiReiterate,
		mdiRestore,
		mdiShare,
		mdiTrashCan
	} from '@mdi/js';
	import Button from '../components/Button.svelte';
	import Window from '../components/Window.svelte';
	import TabItem from '../components/TabItem.svelte';
	import Sheet from '../components/Sheet.svelte';
	import SortableList from '../components/SortableList.svelte';
	import { onMount } from 'svelte';
	import { gpuStore, isCompleteGpuStore, isLoading } from '../gpuStore';
	import { Universe } from '../../Universe';
	import Canvas from '../../compute/Canvas.svelte';
	import { fly } from 'svelte/transition';

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

		await gpuStore.init();

		const universeArray = new Float32Array(inputUniverse.to_f32_buffer());
		await gpuStore.setup(HYPERPARAMS, universeArray);

		if (!isCompleteGpuStore($gpuStore)) return;

		console.log('gpuStore', $gpuStore.hyperparameters);

		const resultArrays = await gpuStore.iterate(1);
		console.log('resultArrays', resultArrays);

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

<Window title="Iterations: {iterations}" showSheet={autoPlayPanel}>
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
		{@const gpuIsComplete = isCompleteGpuStore($gpuStore)}
		<Button icon={mdiRestore} tooltip="Reset to step 0" on:click={reset} />

		<Button
			disabled={!gpuIsComplete || $isLoading.loading}
			icon={mdiReiterate}
			tooltip="Step by {iterateStep}"
			on:click={iterate}
		/>

		<input
			type="number"
			class="bg-transparent outline-none rounded text-center hover:bg-gray-200/20 active:bg-gray-200/20 w-16"
			bind:value={iterateStep}
		/>
		<div class="h-full w-0.5 bg-white/40 rounded-full" />

		<div class="flex items-center mx-2 gap-1">
			<div>z =</div>
			<input
				min="0"
				max={HYPERPARAMS.size - 1}
				bind:value={sliceIndex}
				type="range"
				class="block"
				style="accent-color: white"
			/>
		</div>

		<div class="h-full w-0.5 bg-white/40 rounded-full" />

		<Button disabled icon={mdiShare} tooltip="Copy url to this state" />
		<Button disabled icon={mdiExport} tooltip="Export to database" />
		<Button disabled icon={mdiCube} tooltip="Show model in 3D" />

		<div class="h-full w-0.5 bg-white/40 rounded-full" />

		<Button disabled icon={mdiDotsHorizontal} tooltip="Show more options" />
	</svelte:fragment>

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
