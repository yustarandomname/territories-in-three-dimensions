<script lang="ts">
	import { Canvas, Layer, t, type Render } from 'svelte-canvas';

	export let universe: Universe;
	export let isSliding: boolean = false;
	export let sliceIndex: number = 0;

	let render: Render;
	$: render = ({ context, width, height }) => {
		let nodeLength = universe.nodes.length;
		let boxSize = Math.round(width / nodeLength);

		universe.nodes.forEach((node, i) => {
			if (isSliding && sliceIndex != i) return;

			let totalNodes = node.blue_agents + node.red_agents;
			context.beginPath();
			context.fillStyle = `rgb(${Math.round(255 * (node.red_agents / totalNodes))}, 0, ${Math.round(
				255 * (node.blue_agents / totalNodes)
			)})`;
			context.fillRect(boxSize * i, (height - 100) / 2, boxSize, 100);
			context.closePath();
		});
	};
</script>

<div class="w-full h-full flex justify-center items-center">
	<Canvas class="border w-full" height={640}>
		<Layer {render} />
	</Canvas>
</div>
