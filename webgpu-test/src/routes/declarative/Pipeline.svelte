<script lang="ts">
	import gpuStore, { type GpuStore } from './gpuStore';

	export let entryPoint: string;

	function createPipeline({ device, module }: GpuStore) {
		const pipelineLayout = device.createPipelineLayout({
			label: 'Cell Pipeline Layout',
			bindGroupLayouts: [gpuStore.getBindGroupLayout()]
		});

		const computePipeline = device.createComputePipeline({
			label: `${entryPoint} pipeline`,
			layout: pipelineLayout,
			compute: {
				module,
				entryPoint
			}
		});

		// Setup a bindGroup to tell the shader which buffer to use for the computation
		// For each iterations we need to swap the input and output buffers
		// const bindGroups = //TODO;

		// return { computePipeline, bindGroups };
	}
</script>
