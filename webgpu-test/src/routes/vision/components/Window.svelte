<script>
	export let title = 'Window';
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
			<div class="-bottom-12 absolute flex justify-center w-full transform ornamentContainer">
				<div
					class="ornament bg-gray-400/60 backdrop-blur-lg rounded-full flex p-3 gap-2 opacity-80 hover:opacity-100"
				>
					<slot name="ornament" />
				</div>
			</div>
		{/if}

		<!-- Tab group -->
		{#if $$slots.tabGroup}
			<div class="-left-12 absolute flex h-full flex-col justify-center">
				<div
					class="tabGroup bg-gray-400/60 backdrop-blur-lg h-fit rounded-full flex flex-col py-3 px-2 gap-2 opacity-80 hover:opacity-100"
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

<style>
	.ornamentContainer {
		perspective: 10rem;
	}

	.ornament {
		transition: transform 0.3s ease-in-out;
		transform-style: preserve-3d;
		transform: rotateX(3deg);
	}

	.ornamentContainer:hover > .ornament {
		transform: rotateX(0deg);
	}
</style>
