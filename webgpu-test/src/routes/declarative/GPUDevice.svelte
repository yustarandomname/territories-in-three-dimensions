<script lang="ts">
	import { onMount } from 'svelte';
	import gpuStore from './gpuStore';

	export let adapterOptions: GPURequestAdapterOptions | undefined = undefined;
	export let deviceDescriptor: GPUDeviceDescriptor | undefined = undefined;

	let error: string | undefined = undefined;
	let adapter: GPUAdapter | undefined = undefined;
	let device: GPUDevice | undefined = undefined;

	onMount(async () => {
		let gpuAdapter = await navigator.gpu?.requestAdapter(adapterOptions);
		if (!gpuAdapter) {
			error = 'Need a browser that supports WebGPU this demo only works in Chrome version 114+';
			return;
		}
		adapter = gpuAdapter;

		device = await adapter?.requestDevice(deviceDescriptor);
		if (!device) {
			error = 'Need a browser that supports WebGPU this demo only works in Chrome version 114+';
			return;
		}

		gpuStore.init({ adapter, device, buffers: [], pipelines: [] });
	});
</script>

{#if error}
	<slot name="fallback" {error}>
		<div class="w-full h-full fixed top-0 left-0 z-99 flex justify-center items-center p-12">
			<div class="border w-full max-w-4xl mx-auto p-4 rounded">
				{error}
			</div>
		</div>
	</slot>
{:else if !adapter || !device}
	<slot name="loading">
		<div class="w-full h-full fixed top-0 left-0 z-99 flex justify-center items-center p-12">
			<div class="border w-full max-w-4xl mx-auto p-4 rounded">Loading...</div>
		</div>
	</slot>
{:else}
	<slot {adapter} {device} />
{/if}
