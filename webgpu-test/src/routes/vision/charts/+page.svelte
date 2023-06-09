<script lang="ts">
	import { getContext } from 'svelte';
	import type { LayoutData } from '../layoutData';

	import AgentDensityPlot from '../../compute-3d/AgentDensityPlot.svelte';

	const { outputUniverse, HYPERPARAMS, sliceIndex } = getContext<LayoutData>('layoutData');
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
