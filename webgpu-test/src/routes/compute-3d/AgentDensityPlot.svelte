<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Node } from '../Universe';
	import Chart from 'chart.js/auto';

	export let nodes: Node[];
	let canvasEl: HTMLCanvasElement;
	let chart: Chart | null = null;

	function getData() {
		return {
			labels: nodes.map((_, i) => i),
			datasets: [
				{
					label: 'Density of red agents',
					borderColor: 'rgba(255,99,132,1)',
					data: nodes.map((node) => node.red_agents / (node.red_agents + node.blue_agents))
				},
				{
					label: 'Density of blue agents',
					borderColor: 'rgba(54, 162, 235, 1)',
					data: nodes.map((node) => node.blue_agents / (node.red_agents + node.blue_agents))
				}
			]
		};
	}

	$: {
		if (canvasEl && nodes) {
			if (chart) {
				chart.destroy();
			}
			chart = new Chart(canvasEl, {
				type: 'line',
				data: getData(),
				options: {
					animation: { duration: 0 }
				}
			});
		}
	}

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div class="h-64 w64 flex justify-center mt-12">
	<canvas bind:this={canvasEl} />
</div>
