<script>
	import {
		mdiArchive,
		mdiChartLine,
		mdiCube,
		mdiDotsHorizontal,
		mdiExport,
		mdiImage,
		mdiReiterate,
		mdiRestore,
		mdiShare
	} from '@mdi/js';
	import Button from '../components/Button.svelte';
	import Window from '../components/Window.svelte';
	import TabItem from '../components/TabItem.svelte';

	let autoPlayPanel = false;
	let iterateStep = 10000;
</script>

<Window title="Iterations: 100">
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
			class="bg-transparent outline-none rounded text-center hover:bg-gray-200/20 active:bg-gray-200/20 w-14"
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
		<TabItem icon={mdiChartLine} tooltip="Charts" />
		<TabItem icon={mdiArchive} tooltip="Archive" />
	</svelte:fragment>
</Window>

<style lang="postcss">
	button.selected {
		@apply bg-white/90 text-black;
	}
</style>
