<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import {
		BackSide,
		BasicShadowMap,
		BoxGeometry,
		BufferAttribute,
		BufferGeometry,
		FrontSide,
		MeshBasicMaterial,
		MeshPhongMaterial
	} from 'three';
	import { DEG2RAD } from 'three/src/math/MathUtils';

	export let bufferVertices: Float32Array;
	export let bufferIndeces: Uint32Array;

	const SCALE = 2.5;
	const { renderer } = useThrelte();

	$: if (renderer) {
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = BasicShadowMap;
		console.log({ renderer });
	}

	let geometry = new BufferGeometry();

	$: geometry.setAttribute('position', new BufferAttribute(bufferVertices, 3));
	$: geometry.setIndex(new BufferAttribute(bufferIndeces, 1));
</script>

<T.DirectionalLight position={[20, 20, 20]} intensity={2.2} castShadow />
<T.DirectionalLight position={[-10, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={1.5} />

<T.PerspectiveCamera makeDefault position={[-10, 10, 10]} fov={15}>
	<OrbitControls enablePan autoRotate enableZoom={false} enableDamping autoRotateSpeed={3} />
</T.PerspectiveCamera>

<T.Mesh scale={[SCALE, SCALE, SCALE]}>
	<T.BoxGeometry />
	<T.MeshBasicMaterial color="blue" transparent opacity={0.1} wireframe={true} />
</T.Mesh>

<T.Group position={[-SCALE / 2, -SCALE / 2, -SCALE / 2]} scale={[SCALE, SCALE, SCALE]}>
	<T.Mesh {geometry} castShadow receiveShadow={false}>
		<T.MeshBasicMaterial color="red" side={FrontSide} />
	</T.Mesh>
	<T.Mesh {geometry} castShadow receiveShadow={false}>
		<T.MeshBasicMaterial color="blue" side={BackSide} />
	</T.Mesh>
</T.Group>

<T.Mesh receiveShadow position.y={-SCALE / 2 - 0.1} rotation.x={DEG2RAD * -90}>
	<T.CircleGeometry args={[2, 60]} />
	<T.MeshStandardMaterial />
</T.Mesh>
