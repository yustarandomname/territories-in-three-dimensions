<script lang="ts">
	import { Button, Input, Label, Modal } from 'flowbite-svelte';
	import { universeStore } from './universeStore';

	export let dimension: string;
	export let dimensionInt: number;
	export let modal_open = false;

	let lattice_size = 10;
	let agent_count = 100;
</script>

<Modal
	size="md"
	title="Setup simulation for {dimension} dimensions"
	bind:open={modal_open}
	on:close={() => (modal_open = true)}
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
				universeStore.setup(dimensionInt, lattice_size, agent_count);
				modal_open = false;
			}}
		>
			Start simulation
		</Button>
	</form>
</Modal>
