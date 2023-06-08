<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';
	import { mdiClose } from '@mdi/js';

	export let title = '';

	const dispatch = createEventDispatcher();
</script>

<div class="flex justify-between items-center">
	<h2 class="text-lg">{title}</h2>
	<Button icon={mdiClose} on:click={() => dispatch('close')} />
</div>

<div class="mt-4">
	<slot />
</div>
