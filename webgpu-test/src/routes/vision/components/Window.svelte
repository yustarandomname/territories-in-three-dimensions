<script>
	import { mdiClose, mdiDotsHorizontal } from '@mdi/js';
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import Button from './Button.svelte';
	import TabItem from './TabItem.svelte';

	export let title = 'Window';
	export let showSheet = true;

	const dispatch = createEventDispatcher();

	let tabs = ['Parameters', 'Agents', 'Settings'];
	let selectedTab = tabs[0];

	let showExpand = false;
</script>

<div class="pt-12 pb-24 aspect-square relative" style="max-width: 85vmin">
	<div class="relative">
		<!-- Title items -->
		<div class="absolute flex justify-between w-full p-4 top-0 items-center">
			<div class="rounded-xl p-3 bg-gray-400/50 backdrop-blur-lg">
				<h1 class="text-lg font-bold text-white-200">{title}</h1>
			</div>

			<slot name="topTrailing" />
		</div>

		<!-- Ornament buttom -->
		{#if $$slots.ornament}
			<div class="bottom-8 absolute w-full transform ornamentContainer">
				{#if !showExpand}
					<div
						in:fly={{ y: 20, duration: 1000 }}
						out:fly={{ y: -20, duration: 500 }}
						class="ornament w-fit bg-gray-700/40 hover:bg-gray-700/50 backdrop-blur-lg rounded-full p-3 flex items-center gap-2"
					>
						<slot name="ornament" />

						{#if $$slots.ornamentExpand}
							<div class="h-8 w-0.5 bg-white/40 rounded-full" />

							<Button
								icon={mdiDotsHorizontal}
								tooltip="Show more options"
								on:click={() => (showExpand = true)}
							/>
						{/if}
					</div>
				{:else}
					<div
						on:mouseleave={() => (showExpand = false)}
						in:fly={{ y: -20, duration: 750 }}
						out:fly={{ y: 20, duration: 500 }}
						style="border-radius: 2.5rem; min-width: 45rem;"
						class="ornament p-8 pt-4 bg-gray-700/40 hover:bg-gray-700/50 backdrop-blur-lg relative"
					>
						<div class="absolute left-4 top-4">
							<TabItem selected icon={mdiClose} on:click={() => (showExpand = false)} />
						</div>

						<div class="flex gap-2 justify-center mb-3">
							{#each tabs as tab}
								<TabItem selected={tab === selectedTab} on:click={() => (selectedTab = tab)}>
									{tab}
								</TabItem>
							{/each}
						</div>

						<div class="absolute right-4 top-4">
							<TabItem
								selected
								on:click={() => {
									showExpand = false;
									dispatch('saveSettings');
								}}>Save settings</TabItem
							>
						</div>

						<slot name="ornamentExpand" {selectedTab} />
					</div>
				{/if}
			</div>
		{/if}

		<!-- Tab group -->
		{#if $$slots.tabGroup}
			<div class="-left-12 absolute flex h-full flex-col justify-center">
				<div
					class="tabGroup bg-gray-400/60 backdrop-blur-lg h-fit rounded-full flex flex-col py-3 px-2 gap-2"
				>
					<slot name="tabGroup" />
				</div>
			</div>
		{/if}

		<!-- Sheet -->
		{#if $$slots.sheet && showSheet}
			<div
				style="min-width: 20rem; min-height: 20rem;"
				class="absolute bg-gray-600/80 backdrop-blur-3xl rounded-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4"
			>
				<slot name="sheet" />
			</div>
		{/if}

		<!-- Main -->
		<div class="rounded-3xl overflow-hidden">
			<slot />
		</div>
	</div>
</div>

<style lang="postcss">
	.ornamentContainer {
		perspective: 10rem;
	}

	.ornament {
		transition: all 0.3s ease-in-out;
		transform-style: preserve-3d;
		transform: rotateX(3deg) translateX(-50%);
		@apply absolute top-0 left-1/2;
	}

	:global(.dark) .ornament {
		@apply bg-gray-400/40;
		&:hover {
			@apply bg-gray-400/50;
		}
	}

	.ornamentContainer:hover > .ornament {
		transform: rotateX(0deg) translateX(-50%);
	}
</style>
