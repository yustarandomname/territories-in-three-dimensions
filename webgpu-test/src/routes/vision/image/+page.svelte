<script lang="ts">
	import { mdiPlus, mdiTrashCan } from '@mdi/js';
	import { getContext } from 'svelte';
	import { Universe } from '../../Universe';
	import Button from '../components/Button.svelte';
	import Sheet from '../components/Sheet.svelte';
	import SortableList from '../components/SortableList.svelte';
	import { gpuStore, isCompleteGpuStore } from '../gpuStore';
	import type { LayoutData } from '../layoutData';
	import Canvas from './../../compute/Canvas.svelte';

	const { outputUniverse, HYPERPARAMS, sliceIndex, iterateStep } =
		getContext<LayoutData>('layoutData');

	let autoPlayPanel = false;
	let iterateAutoStep = 10000;
	let autoPlaySteps: { id: string; steps: number }[] = [
		{ id: 'a', steps: 100 },
		{ id: 'b', steps: 400 },
		{ id: 'c', steps: 1000 }
	];

	async function iterate() {
		if (!isCompleteGpuStore($gpuStore)) return;
		const resultArrays = await gpuStore.iterate($iterateStep);

		if (!resultArrays) return;
		outputUniverse.set(Universe.from_result(resultArrays.result, $HYPERPARAMS.size, 3));
	}

	function removePlayId(id: string) {
		autoPlaySteps = autoPlaySteps.filter((step) => step.id !== id);
	}

	function addPlayId() {
		autoPlaySteps = [...autoPlaySteps, { id: Math.random().toString(), steps: iterateAutoStep }];
	}

	function downloadCanvas() {
		const canvas = document.querySelector('#sliceCanvas canvas') as HTMLCanvasElement | undefined;
		if (!canvas) return;

		let canvasUrl = canvas.toDataURL('image/webp', 0.5);
		const createEl = document.createElement('a');
		createEl.href = canvasUrl;
		const name = JSON.stringify($HYPERPARAMS);
		createEl.download = name + '-image.webp';
		createEl.click();
		createEl.remove();
	}
</script>

{#if !$outputUniverse}
	<div class="h-[640px] w-[640px] bg-purple-900/60" />
{:else}
	<Canvas
		id="sliceCanvas"
		universe={$outputUniverse}
		offset={$sliceIndex * ($HYPERPARAMS.size * $HYPERPARAMS.size)}
	/>
{/if}

<div class="absolute top-2 right-2 m-4 flex gap-4">
	<Button selected on:click={downloadCanvas}>Download image</Button>
	<button
		class=" rounded-full py-2 px-3 hover:bg-gray-300/70 hover:scale-105 bg-gray-400/50 transition-all backdrop-blur-lg"
		class:selected={autoPlayPanel}
		on:click={() => (autoPlayPanel = !autoPlayPanel)}
	>
		Autoplay
	</button>
</div>

<Sheet title="Autoplay" bind:open={autoPlayPanel}>
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
