<script lang="ts">
	import { onMount } from 'svelte';
	import gpuStore, { type GpuStore } from '../gpuStore';

	export let label: string | undefined = undefined;
	export let data: Float32Array;

	onMount(() => {
		function createStorageBuffer({ device }: GpuStore) {
			let storageBuffer = device.createBuffer({
				label: label + ' storage',
				size: data.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
			});
			device.queue.writeBuffer(storageBuffer, 0, data);

			gpuStore.addBuffer(storageBuffer, 'storage');
		}

		gpuStore.update(createStorageBuffer);
	});
</script>
