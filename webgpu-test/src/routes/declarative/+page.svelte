<script lang="ts">
	import GpuDevice from './GPUDevice.svelte';
	import computeShader from '../compute-3d/computeShader3d.wgsl?raw';
	import Module from './Module.svelte';
	import { Universe } from '../Universe';
	import { UniformBuffer, PingPongBuffer, StorageBuffer, ResultBuffer } from './buffers';
	import Pipeline from './Pipeline.svelte';

	let total_agents = 6250000;
	let inputUniverse = new Universe(50, total_agents, 3);
	const input = inputUniverse.to_f32_buffer();

	const HYPERPARAMS = {
		lambda: 0.5,
		gamma: 0.5,
		beta: 0.0000066667,
		size: inputUniverse.size,
		iterations: 0,
		total_agents: total_agents
	};
</script>

<GpuDevice>
	<Module label="Compute" code={computeShader}>
		<UniformBuffer label="Hyper params" data={HYPERPARAMS} />
		<PingPongBuffer label="Cell buffer" data={input} />

		{@const agentsOutArray = new Float32Array(input.length * 6)}
		<StorageBuffer label="Agents out red storage" data={agentsOutArray} />
		<StorageBuffer label="Agents out blue storage" data={agentsOutArray} />

		<ResultBuffer label="Result buffer" maxByteSize={input.byteLength} />

		<Pipeline entryPoint="update_graffiti_and_push_strength" />
	</Module>
</GpuDevice>
