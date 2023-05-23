<script lang="ts">
	import { Button, ButtonGroup, Card, Input, Label, Range, Tabs } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import OneDCanvas from './OneD/Canvas.svelte';
	import Setup from './Setup.svelte';
	import ThreeDCanvas from './ThreeD/Canvas.svelte';
	import TwoDCanvas from './TwoD/Canvas.svelte';
	import { universeStore } from './universeStore';

	export let data: PageData;

	let dimensions = ['1d', '2d', '3d'];
	let delta_time = 10;

	$: hyperParameters = $universeStore[data.dimensionId]?.hyper_params;

	let isSliding = false;
	let sliceIndex = 0;

	let modal_open = false;

	function setHyperParameters() {
		if (!hyperParameters) return;

		hyperParameters.beta = Number(hyperParameters.beta);
		console.log('setHyperParameters', hyperParameters);
		universeStore.set_parameters(data.dimensionInt, hyperParameters);
	}

	function resetSliding() {
		isSliding = false;
		sliceIndex = 0;
	}

	onMount(() => {
		universeStore.update(1);
		universeStore.update(2);
		universeStore.update(3);
	});

	type UniverseId = 'u1' | 'u2' | 'u3';
	$: universeId = (
		data.dimension == '1d' ? 'u1' : data.dimension == '2d' ? 'u2' : 'u3'
	) as UniverseId;
	$: currentUniverse = $universeStore[universeId];
</script>

<Tabs
	style="pill"
	class="justify-center absolute w-full p-3 bg-white/90"
	contentClass="hidden"
	divider={false}
>
	{#each dimensions as dimension}
		<Button outline={dimension != data.dimension} href="/{dimension}">{dimension}</Button>
	{/each}
</Tabs>

{#if data.dimension == '1d' && $universeStore.u1}
	<OneDCanvas universe={$universeStore.u1} {isSliding} {sliceIndex} />
{:else if data.dimension == '2d' && $universeStore.u2}
	<TwoDCanvas universe={$universeStore.u2} {isSliding} {sliceIndex} />
{:else if data.dimension == '3d' && $universeStore.u3}
	<ThreeDCanvas universe={$universeStore.u3} {isSliding} {sliceIndex} />
{:else}
	<p>Loading...</p>
{/if}

<Setup dimension={data.dimension} dimensionInt={data.dimensionInt} bind:modal_open />

<div class="fixed bottom-8 right-4 flex flex-col gap-3">
	<Card>
		<h4 class="text-xl">Quick setting</h4>

		<Label defaultClass="mt-2">Slide through X:</Label>
		<div
			on:mousedown={() => (isSliding = true)}
			on:touchstart={() => (isSliding = true)}
			on:mouseup={resetSliding}
		>
			<Range
				id="range-minmax"
				min="0"
				max={(currentUniverse?.size || 1) - 1}
				bind:value={sliceIndex}
				on:change={resetSliding}
			/>
		</div>
		<p>Value: {sliceIndex}</p>

		{#if hyperParameters}
			<Label defaultClass="mt-2">Hyper parameters:</Label>
			<Input type="number" bind:value={hyperParameters.beta} on:change={setHyperParameters} />
			<p>Beta: {hyperParameters.beta}</p>

			<Range
				class="mt-2"
				min="0"
				max="1"
				step="0.1"
				bind:value={hyperParameters.gamma}
				on:change={setHyperParameters}
			/>
			<p>Gamma: {hyperParameters.gamma}</p>
			<Range
				class="mt-2"
				min="0"
				max="1"
				step="0.1"
				bind:value={hyperParameters.lambda}
				on:change={setHyperParameters}
			/>
			<p>Lambda: {hyperParameters.lambda}</p>
		{/if}
		<Button class="mt-4" on:click={() => (modal_open = true)}>Reset model</Button>
	</Card>
	<Card>
		<ButtonGroup>
			{@const dimension = data.dimension == '1d' ? 1 : data.dimension == '2d' ? 2 : 3}
			<Button disabled>{$universeStore[universeId]?.iteration || 0}</Button>
			<Input
				type="number"
				name="delta_time"
				placeholder="Delta time"
				bind:value={delta_time}
				required
			/>
			<Button on:click={() => universeStore.increment(dimension, delta_time)}>Apply step</Button>
		</ButtonGroup>
	</Card>
</div>
