<script lang="ts">
	import Chart from 'chart.js/auto';
	import { settingStore } from '../vision/settingStore';

	type OrderParams = { iter: number; result: number }[];
	export let orderParams: OrderParams;
	export let id: string;
	let canvasEl: HTMLCanvasElement;

	function setupChart(canvasEl: HTMLCanvasElement, orderParams: OrderParams) {
		const data = {
			labels: orderParams.map(({ iter, result }) => iter),
			datasets: [
				{
					label: `Order parameter over time (${$settingStore.orderScale} plot)`,
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
						type: $settingStore.orderScale,
						position: 'bottom'
					}
				}
			}
		});
	}

	$: if (canvasEl && orderParams && $settingStore) setupChart(canvasEl, orderParams);
</script>

<div class="h-64 w-[35rem] flex justify-center mt-12">
	<canvas {id} bind:this={canvasEl} />
</div>
