<script lang="ts">
	import { Icon } from 'mdi-svelte-ts';

	export let icon: string = '';
	export let tooltip: string = '';
	export let disabled: boolean = false;
</script>

<button
	class="p-3 disabled:opacity-70 enabled:hover:bg-gray-200/20 enabled:hover:scale-105 transition-all rounded-full relative"
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

<style>
	button:not(:disabled):hover > .tooltip {
		opacity: 1;
	}
</style>
