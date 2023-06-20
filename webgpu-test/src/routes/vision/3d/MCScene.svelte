<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import {
		BackSide,
		BasicShadowMap,
		BufferAttribute,
		BufferGeometry,
		FrontSide,
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

	$: if (geometry) {
		geometry.setAttribute('position', new BufferAttribute(bufferVertices, 3));
		geometry.setIndex(new BufferAttribute(bufferIndeces, 1));
		geometry.computeVertexNormals();
	}

	let materials: MeshPhongMaterial[] = [
		new MeshPhongMaterial({ color: '#dc2626', side: FrontSide, transparent: true, opacity: 0.9 }),
		new MeshPhongMaterial({ color: '#1d4ed8', side: BackSide, transparent: true, opacity: 0.9 })
	];
</script>

<T.AxesHelper scale={10} />

<T.DirectionalLight position={[3, 10, 10]} castShadow intensity={1.5} />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.5} />
<T.AmbientLight intensity={0.5} />

<T.PerspectiveCamera makeDefault position={[-10, 10, 10]} fov={15}>
	<OrbitControls enablePan enableZoom enableDamping />
</T.PerspectiveCamera>

<T.Mesh scale={[SCALE, SCALE, SCALE]}>
	<T.BoxGeometry />
	<T.MeshBasicMaterial color="blue" transparent opacity={0.1} wireframe={true} />
</T.Mesh>

<T.Group
	position={[SCALE - SCALE / 2, SCALE - SCALE / 2, SCALE - SCALE / 2]}
	scale={[-SCALE, -SCALE, -SCALE]}
>
	<T.Mesh {geometry} material={materials[0]} castShadow receiveShadow={false} />
	<T.Mesh {geometry} material={materials[1]} castShadow receiveShadow={false} />

	<!-- <T.Mesh {geometry} castShadow receiveShadow={false}>
		<T.MeshPhongMaterial color="blue" side={FrontSide} />
	</T.Mesh>
	<T.Mesh {geometry} castShadow receiveShadow={true}>
		<T.MeshPhongMaterial color="red" side={BackSide} />
	</T.Mesh> -->
</T.Group>

<T.Mesh receiveShadow position.y={-SCALE / 2 - 0.1} rotation.x={DEG2RAD * -90}>
	<T.CircleGeometry args={[2, 60]} />
	<T.MeshStandardMaterial />
</T.Mesh>
