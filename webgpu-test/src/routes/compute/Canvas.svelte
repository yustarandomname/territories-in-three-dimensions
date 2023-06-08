<script lang="ts">
	import { Canvas, Layer, type Render } from 'svelte-canvas';
	import type { Universe } from '../Universe';

	export let universe: Universe;
	export let isSliding: boolean = false;
	export let sliceIndex: number = 0;
	export let offset: number = 0;
	export let mayority: boolean = false;

	function range(from: number, to: number, step: number = 1) {
		return Array.from({ length: to - from }, (_, i) => from + i * step);
	}

	let render: Render;
	$: render = ({ context, width, height }) => {
		let boxSizeX = width / universe.size;
		let boxSizeY = height / universe.size;

		for (const y of range(0, universe.size)) {
			for (const x of range(0, universe.size)) {
				let index = x + y * universe.size + offset;
				let node = universe.nodes[index];
				let totalNodes = node.blue_agents + node.red_agents;
				if (isSliding && sliceIndex != x) continue;

				context.beginPath();

				if (!mayority) {
					context.fillStyle = `rgb(${Math.round(
						255 * (node.red_agents / totalNodes)
					)}, 0, ${Math.round(255 * (node.blue_agents / totalNodes))})`;
				} else if (node.red_agents > node.blue_agents) {
					context.fillStyle = `rgb(255, 0, 0)`;
				} else if (mayority && node.blue_agents > node.red_agents) {
					context.fillStyle = `rgb(0, 0, 255)`;
				} else {
					context.fillStyle = `rgb(0, 255, 0)`;
				}

				context.fillRect(boxSizeX * x, boxSizeY * y, boxSizeX, boxSizeY);
				context.closePath();
			}
		}
	};
</script>

<div class="w-full h-full flex justify-center items-center">
	<Canvas class="w-full" height={640}>
		<Layer {render} />
	</Canvas>
</div>
