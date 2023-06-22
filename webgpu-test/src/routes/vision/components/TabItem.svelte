<script lang="ts">
	import { Icon } from 'mdi-svelte-ts';

	export let icon: string = '';
	export let tooltip: string = '';
	export let href: string = '';
	export let selected: boolean = false;
</script>

<a
	class="p-3 disabled:opacity-70 hover:bg-gray-200/40 hover:scale-105 transition-all rounded-full relative"
	class:selected
	{href}
	on:click
>
	<slot>
		{#if icon}
			<Icon path={icon} size={1.3} />
		{/if}
	</slot>

	{#if tooltip}
		<div
			class="tooltip opacity-0 absolute left-full top-1/2 transform -translate-y-1/2 ml-1 bg-gray-400/80 p-2 whitespace-nowrap transition-all rounded-xl text-xs text-white/90"
		>
			{tooltip}
		</div>
	{/if}
</a>

<style lang="postcss">
	a:hover > .tooltip {
		opacity: 1;
	}

	a:not(:hover).selected {
		@apply bg-gray-200/20;
	}
</style>
