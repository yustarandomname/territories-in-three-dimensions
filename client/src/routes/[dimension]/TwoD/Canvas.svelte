<script lang="ts">
	import { Canvas, Layer, t, type Render } from 'svelte-canvas';

	export let universe: Universe;
	export let isSliding: boolean = false;
	export let sliceIndex: number = 0;

	function range(from: number, to: number, step: number = 1) {
		return Array.from({ length: to - from }, (_, i) => from + i * step);
	}

	let render: Render;
	$: render = ({ context, width, height }) => {
		let nodeLength = universe.nodes.length;
		let boxSizeX = width / universe.size;
		let boxSizeY = height / universe.size;

		for (const y of range(0, universe.size)) {
			for (const x of range(0, universe.size)) {
				let index = x + y * universe.size;
				let node = universe.nodes[index];
				let totalNodes = node.blue + node.red;
				if (isSliding && sliceIndex != x) continue;

				context.beginPath();
				context.fillStyle = `rgb(${Math.round(255 * (node.red / totalNodes))}, 0, ${Math.round(
					255 * (node.blue / totalNodes)
				)})`;
				context.fillRect(boxSizeX * x, boxSizeY * y, boxSizeX, boxSizeY);
				context.closePath();
			}
		}
	};
</script>

<div class="w-full h-full flex justify-center items-center">
	<Canvas class="border w-full" height={640}>
		<Layer {render} />
	</Canvas>
</div>
