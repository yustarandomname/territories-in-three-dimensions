<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { LayoutData } from '../layoutData';
	import { fly } from 'svelte/transition';
	import AgentDensityPlot from '../../compute-3d/AgentDensityPlot.svelte';
	import OrderParamsPlot from './../../compute-3d/OrderParamsPlot.svelte';
	import Button from '../components/Button.svelte';
	import { settingStore } from '../settingStore';
	import { convertToCSVAndDownload } from './../toCSV';

	const { outputUniverse, HYPERPARAMS, sliceIndex, orderParams } =
		getContext<LayoutData>('layoutData');

	function downloadCanvas(canvas: HTMLCanvasElement) {
		let canvasUrl = canvas.toDataURL('image/webp', 0.5);
		const createEl = document.createElement('a');
		createEl.href = canvasUrl;
		const name = JSON.stringify($HYPERPARAMS);
		createEl.download = name + '-' + canvas.id + '.webp';
		createEl.click();
		createEl.remove();
	}

	function downloadCanvases() {
		const canvas1 = document.querySelector('#densityChart') as HTMLCanvasElement | undefined;
		const canvas2 = document.querySelector('#orderChart') as HTMLCanvasElement | undefined;
		if (!canvas1 || !canvas2) return;

		downloadCanvas(canvas1);
		downloadCanvas(canvas2);
	}

	function downloadData() {
		convertToCSVAndDownload($orderParams, $HYPERPARAMS);
	}
</script>

<div class="absolute top-2 right-2 m-4 flex gap-4">
	<Button dark on:click={downloadData}>Order csv</Button>
	<Button dark on:click={downloadCanvases}>Download image</Button>
</div>

<div style="min-width: 30rem;" class="h-[30rem] w-[40rem] p-8 flex items-center">
	{#if $outputUniverse?.nodes}
		{#key $outputUniverse || $settingStore.orderScale}
			<OrderParamsPlot id="orderChart" orderParams={$orderParams} />
		{/key}
	{/if}
</div>

<div
	in:fly={{ x: 160, y: -150, duration: 800 }}
	style="perspective: 20rem; left: calc(100% - 3rem);"
	class="absolute -top-44"
>
	<div class="sidePanel bg-gray-300/80 backdrop:blur-xl h-[20rem] rounded-xl p-8 flex items-center">
		{#if $outputUniverse?.nodes}
			{#key $outputUniverse}
				<AgentDensityPlot
					id="densityChart"
					nodes={$outputUniverse.nodes.slice(
						$sliceIndex * ($HYPERPARAMS.size * $HYPERPARAMS.size),
						$sliceIndex * ($HYPERPARAMS.size * $HYPERPARAMS.size) + $HYPERPARAMS.size
					)}
				/>
			{/key}
		{/if}
	</div>
</div>

<style lang="postcss">
	.sidePanel {
		min-width: 30rem;
		transform: rotate3d(1, 1, 0, -5deg);
		transition: all 0.3s ease-in-out;
	}

	.sidePanel:hover {
		min-width: 30rem;
		transform: rotate3d(1, 1, 0, 0deg);
		@apply bg-gray-300;
	}
</style>
