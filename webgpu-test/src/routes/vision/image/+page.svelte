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

	let autoPlayPanel = true;
	let iterateStep = 10000;
	let iterateAutoStep = 10000;
	let autoPlaySteps: { id: String; steps: number }[] = [
		{ id: 'a', steps: 100 },
		{ id: 'b', steps: 400 },
		{ id: 'c', steps: 1000 }
	];

	function removePlayId(id: string) {
		autoPlaySteps = autoPlaySteps.filter((step) => step.id !== id);
	}

	function addPlayId() {
		autoPlaySteps = [...autoPlaySteps, { id: Math.random().toString(), steps: iterateAutoStep }];
	}
</script>

<Window title="Iterations: 100" showSheet={autoPlayPanel}>
	<img alt="rendered version after n iterations" class="h-full w-full" src="/result.png" />

	<button
		slot="topTrailing"
		class="rounded-full py-2 px-3 hover:bg-gray-300/70 hover:scale-105 bg-gray-400/50 transition-all backdrop-blur-lg"
		class:selected={autoPlayPanel}
		on:click={() => (autoPlayPanel = !autoPlayPanel)}
	>
		Autoplay
	</button>

	<svelte:fragment slot="ornament">
		<Button icon={mdiRestore} tooltip="Reset to step 0" />

		<Button icon={mdiReiterate} tooltip="Step by {iterateStep}" />

		<input
			type="number"
			class="bg-transparent outline-none rounded text-center hover:bg-gray-200/20 active:bg-gray-200/20 w-16"
			bind:value={iterateStep}
		/>
		<div class="h-full w-0.5 bg-white/40 rounded-full" />

		<div class="flex items-center mx-2 gap-1">
			<div>z =</div>
			<input type="range" class="block" style="accent-color: white" />
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
					<Button icon={mdiTrashCan} on:click={() => removePlayId(item.steps.id)} />
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
