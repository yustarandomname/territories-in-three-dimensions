<script lang="ts">
	import { onMount } from 'svelte';
	import gpuStore, { type GpuStore } from '../gpuStore';

	export let data: any;
	export let label: string | undefined = undefined;
	export let error: string | undefined = undefined;

	onMount(() => {
		let buffer: Float32Array;
		if (data instanceof Array) {
			buffer = new Float32Array(data);
		} else if (data instanceof Float32Array) {
			buffer = data;
		} else if (data instanceof Object) {
			buffer = new Float32Array(Object.values(data));
		} else {
			error = `Invalid data type for ${label || 'uniform buffer'}`;
			return;
		}

		function createUniforBuffer({ device }: GpuStore) {
			let bufferLabel = `Uniform buffer for ${label || 'uniform buffer id:' + Math.random()}`;
			let uniformBuffer = device.createBuffer({
				label,
				size: buffer.byteLength,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
			});
			device.queue.writeBuffer(uniformBuffer, 0, buffer);

			gpuStore.addBuffer(uniformBuffer, 'uniform', bufferLabel);
		}

		gpuStore.update(createUniforBuffer);
	});
</script>
