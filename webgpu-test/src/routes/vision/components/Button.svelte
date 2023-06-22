<script lang="ts">
	import { Icon } from 'mdi-svelte-ts';

	export let icon: string = '';
	export let tooltip: string = '';
	export let disabled: boolean = false;
	export let selected: boolean = false;
	export let dark: boolean = false;
</script>

<button
	class="p-3 disabled:opacity-70 enabled:hover:scale-105 transition-all rounded-full relative"
	class:selected
	class:dark
	{disabled}
	on:click
>
	<slot>
		{#if icon}
			<Icon path={icon} size={1.3} />
		{/if}
	</slot>

	{#if tooltip}
		<div
			class="tooltip opacity-0 absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-400/80 p-2 whitespace-nowrap transition-all rounded-xl text-xs text-white/90"
		>
			{tooltip}
		</div>
	{/if}
</button>

<style lang="postcss">
	button:not(:disabled):hover {
		@apply bg-gray-200/20;
	}

	button:not(:disabled):hover > .tooltip {
		opacity: 1;
	}

	button:not(:disabled).selected {
		@apply bg-gray-200/20;

		&:hover {
			@apply bg-gray-200/30;
		}
	}

	button:not(:disabled).dark {
		@apply bg-gray-700/20;

		&:hover {
			@apply bg-gray-700/30;
		}
	}
</style>
