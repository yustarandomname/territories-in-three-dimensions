<script lang="ts">
	import { getContext } from 'svelte';
	import type { LayoutData } from '../layoutData';
	import { fly } from 'svelte/transition';
	import AgentDensityPlot from '../../compute-3d/AgentDensityPlot.svelte';
	import OrderParamsPlot from './../../compute-3d/OrderParamsPlot.svelte';

	const { outputUniverse, HYPERPARAMS, sliceIndex, orderParams } =
		getContext<LayoutData>('layoutData');
</script>

<div style="min-width: 30rem;" class="h-[30rem] p-8 flex items-center">
	{#if $outputUniverse?.nodes}
		{#key $outputUniverse}
			<AgentDensityPlot
				nodes={$outputUniverse.nodes.slice(
					$sliceIndex * ($HYPERPARAMS.size * $HYPERPARAMS.size),
					$sliceIndex * ($HYPERPARAMS.size * $HYPERPARAMS.size) + $HYPERPARAMS.size
				)}
			/>
		{/key}
	{/if}
</div>

<div
	in:fly={{ x: 60, y: -50 }}
	style="perspective: 20rem; left: calc(100% - 15rem);"
	class="absolute -top-44"
>
	<div class="sidePanel bg-gray-300/80 backdrop:blur-xl h-[20rem] rounded-xl p-8 flex items-center">
		{#if $outputUniverse?.nodes}
			{#key $outputUniverse}
				<OrderParamsPlot orderParams={$orderParams} />
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
