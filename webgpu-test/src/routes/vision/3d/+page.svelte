<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import init, { Universe, mc } from '../assets/my_crate.js';
	import type { LayoutData } from '../layoutData';
	import { Canvas } from '@threlte/core';
	import MCScene from './MCScene.svelte';

	const { outputUniverse, HYPERPARAMS } = getContext<LayoutData>('layoutData');

	let bufferVertices: Float32Array;
	let bufferIndeces: Uint32Array;
	let wasmInitialized = false;

	function reloadBuffers() {
		if (!$outputUniverse) return console.log('no outputUniverse');

		const universe = Universe.new($outputUniverse.size);
		$outputUniverse.nodes.map((node) => {
			universe.add_node({ red_agents: node.red_agents, blue_agents: node.blue_agents });
		});

		const verticesIndeces = mc(universe);
		const vertices = verticesIndeces.get_vertices();
		const indeces = verticesIndeces.get_indeces();

		bufferVertices = new Float32Array(vertices);
		bufferIndeces = new Uint32Array(indeces);
	}

	$: wasmInitialized && $outputUniverse && reloadBuffers();

	function downloadCanvas(): void {
		const canvas = document.querySelector('#canvas-3d canvas') as HTMLCanvasElement | undefined;
		if (!canvas) return;

		let canvasUrl = canvas.toDataURL('image/webp', 0.5);
		const createEl = document.createElement('a');
		createEl.href = canvasUrl;
		const name = JSON.stringify($HYPERPARAMS);
		createEl.download = name + '-image-3d.webp';
		createEl.click();
		createEl.remove();
	}

	onMount(async () => {
		await init();
		wasmInitialized = true;
	});
</script>

<div id="canvas-3d" class="w-[45rem] h-[45rem]">
	<Canvas>
		{#if bufferVertices && bufferIndeces}
			<MCScene {bufferVertices} {bufferIndeces} />
		{/if}
	</Canvas>
</div>
