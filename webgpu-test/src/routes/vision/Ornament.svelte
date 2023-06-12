<script lang="ts">
	import { mdiCube, mdiReiterate, mdiRestore, mdiShare, mdiUpload } from '@mdi/js';
	import { createEventDispatcher } from 'svelte';
	import Button from './components/Button.svelte';
	import { gpuStore, isCompleteGpuStore, isLoading } from './gpuStore';

	export let iterateStep: number = 1000;
	export let sliceIndex: number = 0;

	$: gpuIsComplete = isCompleteGpuStore($gpuStore);

	const dispatch = createEventDispatcher();

	function uploadResult() {
		isLoading.set('Uploading result to database');

		setTimeout(() => {
			isLoading.reset();
		}, 1000);
	}
</script>

<Button icon={mdiRestore} tooltip="Reset to step 0" on:click={() => dispatch('reset')} />

<Button
	disabled={!gpuIsComplete || $isLoading.loading}
	icon={mdiReiterate}
	tooltip="Step by {iterateStep}"
	on:click={() => dispatch('iterate')}
/>

<input
	type="number"
	class="bg-transparent outline-none rounded text-center hover:bg-gray-200/20 active:bg-gray-200/20 w-16"
	bind:value={iterateStep}
/>
<div class="w-0.5 h-8 bg-white/40 rounded-full" />

<div class="flex items-center mx-2 gap-1">
	<div class="whitespace-nowrap">z =</div>
	<input
		min="0"
		max={'hyperparameters' in $gpuStore ? $gpuStore.hyperparameters.size - 1 : 1}
		bind:value={sliceIndex}
		type="range"
		class="block"
		style="accent-color: white"
	/>
</div>

<div class="h-full w-0.5 bg-white/40 rounded-full" />

<Button disabled icon={mdiShare} tooltip="Copy url to this state" />
<Button icon={mdiUpload} on:click={uploadResult} tooltip="Export to database" />
