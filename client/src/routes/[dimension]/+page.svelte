<script lang="ts">
	import { Button, ButtonGroup, Card, Input, Label, Range, Tabs } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import OneDCanvas from './OneD/Canvas.svelte';
	import Setup from './Setup.svelte';
	import ThreeDCanvas from './ThreeD/Canvas.svelte';
	import TwoDCanvas from './TwoD/Canvas.svelte';
	import { universeStore } from './universeStore';
	import { InfoType, infoTypeStore } from './infoTypeStore';

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

	function toggleInfoType() {
		infoTypeStore.update((type) => (type == InfoType.Agents ? InfoType.Graffiti : InfoType.Agents));
		universeStore.update(data.dimensionInt);
	}

	onMount(() => {
		console.log('update');
		universeStore.update(data.dimensionInt);
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
{:else if !modal_open}
	<Setup dimension={data.dimension} dimensionInt={data.dimensionInt} modal_open={true} />
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

		<ButtonGroup class="mt-4">
			<Button
				class="w-full"
				color="red"
				outline={$infoTypeStore != InfoType.Graffiti}
				on:click={toggleInfoType}
			>
				Show graffiti
			</Button>
			<Button
				class="w-full"
				color="blue"
				outline={$infoTypeStore != InfoType.Agents}
				on:click={toggleInfoType}
			>
				Show agents
			</Button>
		</ButtonGroup>

		<Button class="mt-4" on:click={() => (modal_open = true)}>
			{$universeStore[universeId] ? 'Reset' : 'Setup'} model
		</Button>
	</Card>

	{#if $universeStore[universeId]}
		<Card>
			<ButtonGroup>
				<Button disabled>{$universeStore[universeId]?.iteration || 0}</Button>
				<Input
					type="number"
					name="delta_time"
					placeholder="Delta time"
					bind:value={delta_time}
					required
					on:keydown={(e) =>
						e.key == 'Enter' && universeStore.increment(data.dimensionInt, delta_time)}
				/>
				<Button on:click={() => universeStore.increment(data.dimensionInt, delta_time)}>
					Increment Step
				</Button>
			</ButtonGroup>
		</Card>
	{/if}
</div>
