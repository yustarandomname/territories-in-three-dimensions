<script lang="ts">
	import type { Node } from '../Universe';
	import Chart, { type ChartData } from 'chart.js/auto';

	type OrderParams = { iter: number; result: number }[];
	export let orderParams: OrderParams;
	let canvasEl: HTMLCanvasElement;

	function setupChart(canvasEl: HTMLCanvasElement, orderParams: OrderParams) {
		const data = {
			labels: orderParams.map(({ iter, result }) => iter),
			datasets: [
				{
					label: 'Order parameter over time',
					borderColor: 'rgba(255,99,132,1)',
					data: orderParams.map(({ iter, result }) => result)
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

	$: if (canvasEl && orderParams) setupChart(canvasEl, orderParams);
</script>

<div class="h-64 w64 flex justify-center mt-12">
	<canvas bind:this={canvasEl} />
</div>
