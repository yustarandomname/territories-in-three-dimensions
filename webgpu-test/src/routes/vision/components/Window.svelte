<script lang="ts">
	import { mdiClose, mdiTune } from '@mdi/js';
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import Button from './Button.svelte';
	import TabItem from './TabItem.svelte';

	export let title = 'Window';
	export let path: String | undefined;

	const dispatch = createEventDispatcher();

	let tabs = ['Parameters', 'Agents', 'Settings'];
	let selectedTab = tabs[0];

	let showExpand = false;
</script>

<div
	class:side={path == 'charts'}
	class="pt-12 pb-24 aspect-square absolute transition-transform duration-500"
	style="max-width: 85vmin"
>
	<div class="relative bg-slate-200/80 rounded-3xl">
		<!-- Title items -->

		<div class="absolute top-0 m-4 rounded-xl p-3 bg-gray-400/50 backdrop-blur-lg">
			<h1 class="text-lg font-bold text-white-200">{title}</h1>
		</div>

		<!-- Ornament buttom -->
		{#if $$slots.ornament}
			<div class="z-[100] bottom-8 absolute w-full transform ornamentContainer">
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
								icon={mdiTune}
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
						class="ornament p-8 pt-4 bg-gray-700/40 hover:bg-gray-700/50 -mt-4 backdrop-blur-lg relative"
					>
						<div class="absolute left-4 top-4">
							<Button selected icon={mdiClose} on:click={() => (showExpand = false)} />
						</div>

						<div class="flex gap-2 justify-center mb-3">
							{#each tabs as tab}
								<TabItem selected={tab === selectedTab} on:click={() => (selectedTab = tab)}>
									{tab}
								</TabItem>
							{/each}
						</div>

						<div class="absolute right-4 top-4">
							<Button
								selected
								on:click={() => {
									showExpand = false;
									dispatch('saveSettings');
								}}>Save settings</Button
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
					class="tabGroup bg-gray-600/60 hover:bg-gray-600/70 transition-colors backdrop-blur-lg h-fit rounded-full flex flex-col py-3 px-2 gap-2"
				>
					<slot name="tabGroup" />
				</div>
			</div>
		{/if}

		<!-- Main -->
		<div class="rounded-3xl overflow-hidden">
			<slot />
		</div>
	</div>
</div>

<style lang="postcss">
	.side {
		@apply -translate-x-60;
	}

	.ornamentContainer {
		perspective: 10rem;
	}

	.ornament {
		transition: all 0.3s ease-in-out;
		transform-style: preserve-3d;
		transform: rotateX(5deg) translateX(-50%);
		box-shadow: -1px -2px 1px 0px rgba(255, 255, 255, 0.1);
		@apply absolute top-0 left-1/2;
		&:hover {
			box-shadow: -1px -2px 1px 0px rgba(255, 255, 255, 0.3);
		}
	}

	.tabGroup {
		transition: box-shadow 0.3s ease-in-out;

		box-shadow: -1px -2px 1px 0px rgba(255, 255, 255, 0.5), 2px 3px 10px 3px rgba(50, 50, 50, 0.5);

		&:hover {
			box-shadow: -1px -2px 1px 0px rgba(255, 255, 255, 0.4),
				2px 3px 20px 10px rgba(50, 50, 50, 0.3);
		}
	}

	:global(.dark) .tabGroup {
		@apply bg-gray-400/60;
		&:hover {
			@apply bg-gray-400/70;
		}
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

	@media (prefers-color-scheme: dark) {
		:global(.auto) .tabGroup {
			@apply bg-gray-400/60;
			&:hover {
				@apply bg-gray-400/70;
			}
		}

		:global(.auto) .ornament {
			@apply bg-gray-400/40;
			&:hover {
				@apply bg-gray-400/50;
			}
		}
	}
</style>
