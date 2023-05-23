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
			if (isSliding && sliceIndex != i && Math.abs(sliceIndex - i) != 1) return;

			let totalNodes = node.blue + node.red;
			context.beginPath();

			if (isSliding && Math.abs(sliceIndex - i) == 1) {
				// opacity 0.5
				context.fillStyle = `rgba(${Math.round(255 * (node.red / totalNodes))}, 0, ${Math.round(
					255 * (node.blue / totalNodes)
				)}, 0.5)`;
			} else {
				context.fillStyle = `rgb(${Math.round(255 * (node.red / totalNodes))}, 0, ${Math.round(
					255 * (node.blue / totalNodes)
				)})`;
			}

			context.fillRect(boxSize * i, 0, boxSize, height);
			context.closePath();
		});
	};
</script>

<div class="w-full h-full flex justify-center items-center">
	<Canvas class="border w-full" height={640}>
		<Layer {render} />
	</Canvas>
</div>
