import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import wasmPack from 'vite-plugin-wasm-pack';
import topLevelAwait from 'vite-plugin-top-level-await';



export default defineConfig({
	plugins: [wasmPack(['./my-crate']), sveltekit(), topLevelAwait()],
	optimizeDeps: {
		exclude: ['./my-crate']
	},
	build: {
		target: 'es2020'
	},
});
