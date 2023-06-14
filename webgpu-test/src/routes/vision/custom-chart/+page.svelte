<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';

	type DataSet = { x: number; y: number }[];

	let dataSet: DataSet = [
		{ x: 4e-5, y: 0.6062973368186753 },
		{ x: 3e-5, y: 0.773 },
		{ x: 2e-5, y: 0.903563780667602 },
		{ x: 1e-5, y: 0.884684386514191 },
		{ x: 7.5e-6, y: 0.772628248716569 },
		{ x: 6e-6, y: 0.611145931730384 },
		{ x: 5e-6, y: 0.433373052118191 },
		{ x: 4e-6, y: 0.214946298238467 },
		{ x: 3e-6, y: 0.0734793573127039 },
		{ x: 2.5e-6, y: 0.0448592148986042 },
		{ x: 2e-6, y: 0.0298589450361002 },
		{ x: 1e-6, y: 0.0158753948973474 },
		{ x: 5e-7, y: 0.0121167544312451 }
	];
	let canvasEl: HTMLCanvasElement;

	function setupChart(canvasEl: HTMLCanvasElement, dataSet: DataSet) {
		const data = {
			labels: dataSet.map(({ x, y }) => x),
			datasets: [
				{
					label: `Final order parameter over per beta`,
					borderColor: 'rgba(255,99,132,1)',
					data: dataSet.map(({ x, y }) => y)
				}
			]
		};

		new Chart(canvasEl, {
			type: 'line',
			data: data,
			options: {
				scales: {
					x: {
						type: 'linear',
						position: 'bottom'
					}
				}
			}
		});
	}

	onMount(() => {
		if (canvasEl && dataSet) setupChart(canvasEl, dataSet);
	});
</script>

<div class="h-[20rem] m-12 w-[35rem] flex justify-center mt-12">
	<canvas bind:this={canvasEl} />
</div>
