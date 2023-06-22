<script lang="ts">
	import { onMount } from 'svelte';
	import gpuStore, { type GpuStore } from '../gpuStore';

	export let label: string | undefined = undefined;
	export let maxByteSize: number = 0;

	onMount(() => {
		function createResultBuffer({ device }: GpuStore) {
			let resultBuffer = device.createBuffer({
				label: label,
				size: maxByteSize,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			});

			gpuStore.addResultBuffer(resultBuffer);
		}

		gpuStore.update(createResultBuffer);
	});
</script>
