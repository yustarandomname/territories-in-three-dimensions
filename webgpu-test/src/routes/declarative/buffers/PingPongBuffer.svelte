<script lang="ts">
	import { onMount } from 'svelte';
	import gpuStore, { type GpuStore } from '../gpuStore';

	export let label: string | undefined = undefined;
	export let data: Float32Array;

	onMount(() => {
		function createPingPongBuffer({ device }: GpuStore) {
			let pingBuffer = device.createBuffer({
				label: label + 'state ping',
				size: data.byteLength,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC
			});
			let pongBuffer = device.createBuffer({
				label: label + 'state pong',
				size: data.byteLength,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
			});
			device.queue.writeBuffer(pingBuffer, 0, data);

			gpuStore.addBuffer(pingBuffer, 'read-only-storage');
			gpuStore.addBuffer(pongBuffer, 'storage');
		}

		gpuStore.update(createPingPongBuffer);
	});
</script>
