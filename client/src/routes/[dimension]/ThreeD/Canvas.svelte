<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';

	export let universe: Universe;
	export let isSliding: boolean = false;
	export let sliceIndex: number = 0;
</script>

<div class="w-full h-full">
	<div style="height:100%">
		<Canvas>
			<Scene {universe} {isSliding} {sliceIndex} />
		</Canvas>
	</div>
</div>
