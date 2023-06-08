<script>
	import { settingStore } from './settingStore';
</script>

<div
	class="background h-full w-full text-white flex justify-center items-center"
	class:dark={$settingStore.darkMode}
>
	<slot />
</div>

<style lang="postcss">
	.background {
		transition: all 2s;
	}

	.background::after {
		content: '';
		position: absolute;
		z-index: -2;
		@apply h-full w-full bg-gradient-to-br to-slate-800 from-cyan-800;
	}

	.background::before {
		content: '';
		position: absolute;
		z-index: -1;
		opacity: 1;
		transition: opacity 2s;
		@apply h-full w-full bg-gradient-to-br from-orange-100 to-orange-300;
	}

	.dark.background::before {
		opacity: 0;
	}
</style>
