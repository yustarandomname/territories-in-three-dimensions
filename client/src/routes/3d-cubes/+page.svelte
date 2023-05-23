<script>
	import { Canvas } from '@threlte/core';
	import Scene from '../[dimension]/ThreeD/Scene.svelte';
	import { universeStore } from '../[dimension]/universeStore';
	import { Button, ButtonGroup, Card, Input, Label, Modal } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let model_open = true;
	let lattice_size = 4;
	let agent_count = 5000;
	let delta_time = 10;

	onMount(() => {
		universeStore.update(3);
	});
</script>

{#if $universeStore.u3}
	<div style="height:100%">
		<Canvas>
			<Scene universe={$universeStore.u3} />
		</Canvas>
	</div>

	<div class="fixed bottom-4 right-4 flex flex-col gap-3">
		<Card>
			<h3>Setting</h3>
			<Button on:click={() => (model_open = true)}>Reset model</Button>
		</Card>
		<Card>
			<ButtonGroup>
				<Button disabled>{$universeStore.u3.iteration || 0}</Button>
				<Input
					type="number"
					name="delta_time"
					placeholder="Delta time"
					bind:value={delta_time}
					required
				/>
				<Button on:click={() => universeStore.increment(3, delta_time)}>Apply step</Button>
			</ButtonGroup>
		</Card>
	</div>
{/if}

<Modal
	size="md"
	title="Setup simulation"
	bind:open={model_open}
	on:close={() => (model_open = true)}
>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		TODO: Introduction what this app is Lorem, ipsum dolor sit amet consectetur adipisicing elit.
		Dignissimos obcaecati sequi fugit, vero similique ratione eligendi! Ipsam nisi aut possimus?
		Eligendi harum culpa eos ducimus architecto nobis similique totam asperiores?
	</p>

	<form class="flex flex-col space-y-6" action="#">
		<Label class="space-y-2">
			<span>Size</span>
			<Input
				type="number"
				name="Size"
				placeholder="Size of lattice"
				bind:value={lattice_size}
				required
			/>
		</Label>
		<Label class="space-y-2">
			<span>Number of agents for each species</span>
			<Input
				type="number"
				name="agent_count"
				placeholder="Number of agents"
				bind:value={agent_count}
				required
			/>
		</Label>

		<Button
			type="submit"
			class="w-full1"
			on:click={() => {
				universeStore.setup(3, lattice_size, agent_count);
				model_open = false;
			}}
		>
			Start simulation
		</Button>
	</form>
</Modal>
