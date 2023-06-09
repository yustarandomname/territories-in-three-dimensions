<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';
	import { mdiClose } from '@mdi/js';
	import { fade, fly } from 'svelte/transition';

	export let title = '';
	export let open = false;

	const dispatch = createEventDispatcher();
</script>

{#if open}
	<div
		in:fly={{ y: 20, duration: 200 }}
		out:fade={{ duration: 200 }}
		style="min-width: 20rem; min-height: 20rem;"
		class="absolute bg-gray-600/80 backdrop-blur-3xl rounded-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4"
	>
		<div class="flex justify-between items-center">
			<h2 class="text-lg">{title}</h2>
			<Button
				icon={mdiClose}
				on:click={() => {
					open = false;
					dispatch('close');
				}}
			/>
		</div>

		<div class="mt-4">
			<slot />
		</div>
	</div>
{/if}
