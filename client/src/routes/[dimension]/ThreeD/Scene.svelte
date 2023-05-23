<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';

	export let universe: Universe;
	export let isSliding: boolean = false;
	export let sliceIndex: number = 0;
</script>

<T.DirectionalLight position={[3, 10, 10]} castShadow />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={0.5} />

<T.PerspectiveCamera makeDefault position={[-10, 10, 10]} fov={15}>
	<OrbitControls enablePan autoRotate enableZoom={false} enableDamping autoRotateSpeed={3} />
</T.PerspectiveCamera>

<T.Group scale={(1 / universe.size) * 2} position={[-1, -1, -1]}>
	{#each new Array(universe.size) as _, z}
		{#each new Array(universe.size) as _, y}
			{#each new Array(universe.size) as _, x}
				{#if !(isSliding && sliceIndex != x)}
					{@const index =
						z * universe.size * universe.size + y * universe.size + (x % universe.size)}
					{@const node = universe.nodes[index]}
					{@const totalAgents = node.blue + node.red}
					{@const blueRatio = node.blue / totalAgents}
					{@const redRatio = node.red / totalAgents}

					<T.Mesh position.x={x} position.y={y} position.z={z}>
						<T.BoxGeometry />

						<T.MeshBasicMaterial
							color="rgb({Math.round(redRatio * 255)},0,{Math.round(blueRatio * 255)})"
						/>
					</T.Mesh>
				{/if}
			{/each}
		{/each}
	{/each}
</T.Group>
