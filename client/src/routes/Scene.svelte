<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import {
		BackSide,
		BufferAttribute,
		BufferGeometry,
		DoubleSide,
		Float32BufferAttribute,
		MeshBasicMaterial
	} from 'three';
	import { DEG2RAD } from 'three/src/math/MathUtils';

	let geometry = new BufferGeometry();

	interface Triangle {
		p1: [number, number, number];
		p2: [number, number, number];
		p3: [number, number, number];
	}

	let triangles: Triangle[] = [
		{ p1: [1.0, 0.5, 1.0], p2: [0.0, 0.5, 1.0], p3: [0.5, 0.0, 0.0] },
		{ p1: [1.0, 0.5, 1.0], p2: [0.5, 0.0, 0.0], p3: [1.0, 0.0, 0.5] },
		{ p1: [0.0, 0.5, 1.0], p2: [0.0, 1.0, 0.5], p3: [0.5, 0.0, 0.0] },
		{ p1: [1.0, 0.5, 0.0], p2: [0.5, 0.0, 0.0], p3: [1.0, 1.0, 0.5] },
		{ p1: [0.0, 1.0, 0.5], p2: [1.0, 1.0, 0.5], p3: [0.5, 0.0, 0.0] }
	];

	let vertices: number[] = [];
	let colors: number[] = [];

	for (const triangle of triangles) {
		vertices.push(triangle.p1[0], triangle.p1[1], triangle.p1[2]);
		vertices.push(triangle.p2[0], triangle.p2[1], triangle.p2[2]);
		vertices.push(triangle.p3[0], triangle.p3[1], triangle.p3[2]);

		colors.push(1, 0, 0, 1);
		colors.push(1, 0, 0, 1);
		colors.push(1, 0, 0, 1);

		colors.push(0, 1, 0, 1);
		colors.push(0, 1, 0, 1);
		colors.push(0, 1, 0, 1);
	}

	let bufferVertices = new Float32Array(vertices);

	geometry.setAttribute('position', new BufferAttribute(bufferVertices, 3));
	geometry.setAttribute('color', new Float32BufferAttribute(colors, 8));

	let materials: MeshBasicMaterial[] = [
		new MeshBasicMaterial({ color: 'red', side: DoubleSide }),
		new MeshBasicMaterial({ color: 'green', side: BackSide })
	];
</script>

<T.DirectionalLight position={[3, 10, 10]} castShadow />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={0.5} />

<T.PerspectiveCamera makeDefault position={[-10, 10, 10]} fov={15}>
	<OrbitControls enablePan autoRotate enableZoom={false} enableDamping autoRotateSpeed={3} />
</T.PerspectiveCamera>

<T.Mesh>
	<T.BoxGeometry />
	<T.MeshPhongMaterial color="blue" transparent opacity={0.1} wireframe={true} />
</T.Mesh>

<T.Group position={[-0.5, -0.5, -0.5]}>
	<T.Mesh castShadow {geometry} material={materials[0]} />
	<T.Mesh castShadow {geometry} material={materials[1]} />
</T.Group>

<T.Mesh receiveShadow position.y={-0.5} rotation.x={DEG2RAD * -90}>
	<T.CircleGeometry args={[2, 60]} />
	<T.MeshStandardMaterial />
</T.Mesh>
