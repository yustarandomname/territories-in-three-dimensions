<script>
	import { settingStore } from '../settingStore';
	import Button from './Button.svelte';
</script>

<div class="flex items-center">
	<p class="inline-block mr-4 whitespace-nowrap">Toggle order scale:</p>

	{#if $settingStore.orderScale == 'linear'}
		<Button selected on:click={() => settingStore.set('orderScale', 'logarithmic')}>Linear</Button>
	{:else}
		<Button selected on:click={() => settingStore.set('orderScale', 'linear')}>Logarithmic</Button>
	{/if}
</div>
