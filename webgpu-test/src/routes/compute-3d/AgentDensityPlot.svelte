<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Node } from '../Universe';
	import Chart from 'chart.js/auto';
	import { settingStore } from '../vision/settingStore';

	export let nodes: Node[];
	export let id: string;
	let canvasEl: HTMLCanvasElement;
	let chart: Chart | null = null;

	$: redData = nodes.map((node) => {
		if ($settingStore.densityType == 'relative') {
			return node.red_agents / (node.red_agents + node.blue_agents);
		} else {
			return node.red_agents;
		}
	});

	$: blueData = nodes.map((node) => {
		if ($settingStore.densityType == 'relative') {
			return node.blue_agents / (node.red_agents + node.blue_agents);
		} else {
			return node.blue_agents;
		}
	});

	function getData() {
		return {
			labels: nodes.map((_, i) => i),
			datasets: [
				{
					label: 'Density of red agents',
					borderColor: 'rgba(255,99,132,1)',
					data: redData
				},
				{
					label: 'Density of blue agents',
					borderColor: 'rgba(54, 162, 235, 1)',
					data: blueData
				}
			]
		};
	}

	$: {
		if (canvasEl && nodes && $settingStore.densityType) {
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
	<canvas {id} bind:this={canvasEl} />
</div>
