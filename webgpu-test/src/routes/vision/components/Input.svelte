<script lang="ts">
	export let input: string;
	export let value: number;
	export let label: string;

	let error = false;

	function handleKeydown() {
		try {
			let parsed = eval(input);
			if (typeof parsed === 'number') {
				value = parsed;
				error = false;
			} else {
				error = true;
			}
		} catch (e) {
			error = true;
		}
	}
</script>

<label class="flex items-center">
	<p class="inline-block w-16">{label}:</p>
	<input
		bind:value={input}
		on:keyup={handleKeydown}
		class="px-3 py-2 ml-2 rounded-lg bg-gray-400/50 hover:bg-gray-300/50 active:bg-gray-300/50 transition-colors"
		class:error
	/>
</label>

<style lang="postcss">
	.error {
		transition: background-color 0.1s;
		@apply bg-red-300/50;
	}
</style>
