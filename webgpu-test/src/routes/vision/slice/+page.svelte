<script lang="ts">
	import { mdiPlus, mdiTrashCan } from '@mdi/js';
	import { getContext } from 'svelte';
	import { Universe } from '../../Universe';
	import Button from '../components/Button.svelte';
	import Input from '../components/Input.svelte';
	import Sheet from '../components/Sheet.svelte';
	import SortableList from '../components/SortableList.svelte';
	import { gpuStore, isCompleteGpuStore } from '../gpuStore';
	import type { LayoutData } from '../layoutData';
	import Canvas from '../../compute/Canvas.svelte';
	import { settingStore } from '../settingStore';

	const { outputUniverse, HYPERPARAMS, sliceIndex, iterateStep } =
		getContext<LayoutData>('layoutData');
	const resetFn = getContext<() => void>('resetFn');
	const playConfettti = getContext<() => void>('playConfettti');

	type ResultArrays = { result: Float32Array; orderResult: Float32Array };
	const handleResultArray =
		getContext<(resultArrays: ResultArrays | undefined) => void>('handleResultArray');

	let autoPlayPanel = false;
	let iterateAutoStep = 10000;
	let timeRemaining: string | undefined;
	let timeTaken: string | undefined;
	let playedSteps = 0;

	$: totalAmount = $settingStore.autoPlaySteps.reduce(
		(acc, curr) => acc + curr.steps * curr.amount,
		0
	);

	async function iterate() {
		if (!isCompleteGpuStore($gpuStore)) return;
		const resultArrays = await gpuStore.iterate($iterateStep);

		if (!resultArrays) return;
		outputUniverse.set(Universe.from_result(resultArrays.result, $HYPERPARAMS.size, 3));

		handleResultArray(resultArrays);
	}

	function removePlayId(id: string) {
		$settingStore.autoPlaySteps = $settingStore.autoPlaySteps.filter((step) => step.id !== id);
	}

	function addPlayId() {
		$settingStore.autoPlaySteps = [
			...$settingStore.autoPlaySteps,
			{ id: Math.random().toString(), steps: iterateAutoStep, amount: 1 }
		];
	}

	function downloadCanvas() {
		const canvas = document.querySelector('#sliceCanvas canvas') as HTMLCanvasElement | undefined;
		if (!canvas) return;

		let canvasUrl = canvas.toDataURL('image/webp', 0.5);
		const createEl = document.createElement('a');
		createEl.href = canvasUrl;
		const name = JSON.stringify($HYPERPARAMS);
		createEl.download = name + '-image.webp';
		createEl.click();
		createEl.remove();
	}

	async function playAll() {
		autoPlayPanel = false;
		timeTaken = undefined;
		const timeStart = performance.now();

		settingStore.set('autoPlaySteps', $settingStore.autoPlaySteps);

		playedSteps = 0;

		for (let step of $settingStore.autoPlaySteps) {
			settingStore.set('autoPlaySteps', $settingStore.autoPlaySteps);
			iterateStep.set(step.steps);
			for (let amount of new Array(step.amount).fill(0)) {
				await iterate();

				playedSteps += step.steps;

				const now = performance.now();
				const timeElapsed = now - timeStart;

				const estimatedTimeRemaining = ((totalAmount - playedSteps) / playedSteps) * timeElapsed;
				timeRemaining = new Intl.DateTimeFormat('en', {
					minute: '2-digit',
					second: '2-digit'
				}).format(estimatedTimeRemaining);
			}
		}

		timeRemaining = undefined;
		timeTaken = new Intl.DateTimeFormat('en', {
			minute: '2-digit',
			second: '2-digit'
		}).format(performance.now() - timeStart);

		playConfettti();
	}

	async function resetPlayAll() {
		await resetFn();

		await playAll();
	}
</script>

{#if timeTaken}
	<div class="absolute bottom-12 right-2 p-4 rounded-lg bg-slate-600">
		Time taken to iterate: {timeTaken}
	</div>
{:else if timeRemaining}
	<div class="absolute bottom-12 right-2 p-4 rounded-lg bg-slate-600">
		<p>Steps: {playedSteps} / {totalAmount}</p>
		<p>Time remaining: {timeRemaining}</p>
	</div>
{/if}

{#if !$outputUniverse}
	<div class="h-[640px] w-[640px] bg-purple-900/60" />
{:else}
	<Canvas
		id="sliceCanvas"
		universe={$outputUniverse}
		offset={$sliceIndex * ($HYPERPARAMS.size * $HYPERPARAMS.size)}
	/>
{/if}

<div class="absolute top-2 right-2 m-4 flex gap-4">
	<Button selected on:click={downloadCanvas}>Download image</Button>
	<button
		class=" rounded-full py-2 px-3 hover:bg-gray-300/70 hover:scale-105 bg-gray-400/50 transition-all backdrop-blur-lg"
		class:selected={autoPlayPanel}
		on:click={() => (autoPlayPanel = !autoPlayPanel)}
	>
		Autoplay
	</button>
</div>

<Sheet title="Autoplay | total steps: {totalAmount}" bind:open={autoPlayPanel}>
	<ol class="sortableList">
		<SortableList
			list={$settingStore.autoPlaySteps}
			key="id"
			on:sort={(ev) => ($settingStore.autoPlaySteps = ev.detail)}
			let:item
			let:index
		>
			<div class="w-full flex items-center justify-between gap-2">
				<Input
					label="steps"
					input={item.steps.toString()}
					bind:value={$settingStore.autoPlaySteps[index].steps}
				/>
				<Input
					label="times"
					input={item.amount.toString()}
					bind:value={$settingStore.autoPlaySteps[index].amount}
				/>
				<Button icon={mdiTrashCan} on:click={() => removePlayId(item.id)} />
			</div>
		</SortableList>
	</ol>

	<div class="w-full flex justify-end mt-2 items-center gap-4 whitespace-nowrap">
		<Input label="Add step" input={iterateAutoStep.toString()} bind:value={iterateAutoStep} />

		<Button selected icon={mdiPlus} on:click={addPlayId} />
	</div>

	<div class="flex gap-4">
		<Button selected icon={mdiPlus} on:click={resetPlayAll}>Reset and play all</Button>
		<Button icon={mdiPlus} on:click={playAll}>Play all</Button>
	</div>
</Sheet>
