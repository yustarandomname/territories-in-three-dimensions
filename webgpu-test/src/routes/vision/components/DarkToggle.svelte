<script>
	import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
	import { settingStore } from '../settingStore';
	import Button from './Button.svelte';
</script>

<div class="flex items-center">
	<p class="inline-block mr-4 whitespace-nowrap">Toggle dark:</p>

	{#if $settingStore.darkMode == 'dark'}
		<Button
			selected
			icon={mdiWeatherNight}
			on:click={() => settingStore.set('darkMode', 'light')}
		/>
	{:else}
		<Button
			selected
			icon={mdiWhiteBalanceSunny}
			on:click={() => settingStore.set('darkMode', 'dark')}
		/>
	{/if}
</div>
