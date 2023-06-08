<script>
	import { mdiMoonFirstQuarter, mdiSunAngle } from '@mdi/js';
	import { settingStore } from '../settingStore';
	import TabItem from './TabItem.svelte';
</script>

<div class="flex items-center">
	<p class="inline-block mr-4 whitespace-nowrap">Toggle dark:</p>

	{#if $settingStore.darkMode}
		<TabItem
			selected
			icon={mdiMoonFirstQuarter}
			on:click={() => settingStore.set('darkMode', false)}
		/>
	{:else}
		<TabItem selected icon={mdiSunAngle} on:click={() => settingStore.set('darkMode', true)} />
	{/if}
</div>
