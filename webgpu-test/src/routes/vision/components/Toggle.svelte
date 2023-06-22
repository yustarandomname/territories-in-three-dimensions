<script lang="ts">
	import { settingStore, type Settings } from '../settingStore';
	import Button from './Button.svelte';

	export let options: [string, string];
	export let key: keyof Settings;
	export let title: string;
</script>

<div class="flex items-center mb-2">
	<p class="inline-block mr-4 whitespace-nowrap">Toggle {title}:</p>

	{#if $settingStore[key] == options[0]}
		<Button selected on:click={() => settingStore.set(key, options[1])}>{options[0]}</Button>
	{:else}
		<Button selected on:click={() => settingStore.set(key, options[0])}>{options[1]}</Button>
	{/if}
</div>
