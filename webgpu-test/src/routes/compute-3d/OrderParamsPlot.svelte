<script lang="ts">
	import type { Node } from '../Universe';
	import Chart, { type ChartData } from 'chart.js/auto';

	type OrderParams = { x: number; y: number }[];
	export let orderParams: OrderParams;
	let canvasEl: HTMLCanvasElement;

	function setupChart(canvasEl: HTMLCanvasElement, orderParams: OrderParams) {
		const data = {
			labels: orderParams.map(({ x, y }) => x),
			datasets: [
				{
					label: 'Order parameter over time',
					borderColor: 'rgba(255,99,132,1)',
					data: orderParams.map(({ x, y }) => y)
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

	$: if (canvasEl) setupChart(canvasEl, orderParams);
</script>

<div class="h-64 w64 flex justify-center mt-12">
	<canvas bind:this={canvasEl} />
</div>
