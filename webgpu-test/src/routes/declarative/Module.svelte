<script lang="ts">
	import { onMount } from 'svelte';
	import gpuStore, { type GpuStore } from './gpuStore';

	export let label: string | undefined = undefined;
	export let code: string;

	let shaderModule: GPUShaderModule;

	function createShaderModule({ device }: GpuStore) {
		return device.createShaderModule({
			label,
			code
		});
	}

	onMount(async () => {
		gpuStore.addShaderModule(createShaderModule);
	});
</script>

{#if shaderModule}
	<slot {shaderModule} />
{/if}
