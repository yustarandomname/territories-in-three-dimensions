<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import {
		AxesHelper,
		BackSide,
		BasicShadowMap,
		BufferAttribute,
		BufferGeometry,
		Float32BufferAttribute,
		FrontSide
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

	let normals = new Float32Array(bufferVertices.length);
	$: for (let i = 0; i < bufferVertices.length; i += 3) {
		normals[i] = -1;
	}

	$: geometry.setAttribute('position', new BufferAttribute(bufferVertices, 3));
	$: geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
	$: geometry.setIndex(new BufferAttribute(bufferIndeces, 1));
</script>

<T.AxesHelper scale={10} />

<T.DirectionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
<!-- <T.DirectionalLight position={[-10, 10, -10]} intensity={0.2} castShadow /> -->
<T.AmbientLight intensity={0.5} />

<T.PerspectiveCamera makeDefault position={[-10, 10, 10]} fov={15}>
	<OrbitControls enablePan autoRotate enableZoom enableDamping autoRotateSpeed={3} />
</T.PerspectiveCamera>

<T.Mesh scale={[SCALE, SCALE, SCALE]}>
	<T.BoxGeometry />
	<T.MeshBasicMaterial color="blue" transparent opacity={0.1} wireframe={true} />
</T.Mesh>

<T.Group
	position={[SCALE - SCALE / 2, SCALE - SCALE / 2, SCALE - SCALE / 2]}
	scale={[-SCALE, -SCALE, -SCALE]}
>
	<T.Mesh {geometry} castShadow receiveShadow={false}>
		<T.MeshPhongMaterial color="blue" side={FrontSide} />
	</T.Mesh>
	<T.Mesh {geometry} castShadow receiveShadow={true}>
		<T.MeshBasicMaterial color="red" side={BackSide} />
	</T.Mesh>
</T.Group>

<T.Mesh receiveShadow position.y={-SCALE / 2 - 0.1} rotation.x={DEG2RAD * -90}>
	<T.CircleGeometry args={[2, 60]} />
	<T.MeshStandardMaterial />
</T.Mesh>
