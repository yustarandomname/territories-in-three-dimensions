import { get, writable } from "svelte/store";
import type { OutputBuffers, Pipeline, StorageBuffers } from "../compute-3d/setup";
import setup from "../compute-3d/setup";
import iterate from "../compute-3d/iterate";

type isLoading = { loading: true, message: string } | { loading: false }
type hasError = { hasError: true, message: string } | { hasError: false }

function isLoadingStore() {
    const { subscribe, set } = writable<isLoading>({ loading: false });

    return {
        subscribe,
        set: (message: string) => set({ loading: true, message }),
        reset: () => set({ loading: false })
    };
}

function hasErrorStore() {
    const { subscribe, set } = writable<hasError>({ hasError: false });

    return {
        subscribe,
        set: (message: string) => {
            isLoading.reset();
            set({ hasError: true, message })
        },
        reset: () => set({ hasError: false })
    };
}

export const isLoading = isLoadingStore();
export const hasError = hasErrorStore();

export type HyperParameters = {
    lambda: number;
    gamma: number;
    beta: number;
    size: number;
    iterations: number;
    total_agents: number;
}

export type CompleteGpuStore = {
    device: GPUDevice,
    pipelines: Pipeline,
    hyperparameters: HyperParameters,
    storageBuffers: StorageBuffers,
    outputBuffers: OutputBuffers,
}

type GPUStore = {
    device: null,
} | {
    device: GPUDevice,
} | CompleteGpuStore

function createGpuStore() {
    const { subscribe, set, update } = writable<GPUStore>({ device: null });

    return {
        subscribe,
        init: async () => {
            isLoading.set("Initializing GPU");
            const adapter = await navigator.gpu?.requestAdapter({ powerPreference: 'high-performance' });
            const gpuDevice = await adapter?.requestDevice();
            if (!gpuDevice) {
                hasError.set("No GPU found. You need a browser that supports WebGPU. This demo only works in Chrome version 114+ on Desktop computers.");
                return;
            }
            set({ device: gpuDevice })
            isLoading.reset();
            hasError.reset()
        },
        setup: async (hyperparams: HyperParameters, universeArray: Float32Array) => {
            isLoading.set("Setting up GPU");
            const gpuDevice = get(gpuStore).device;

            if (!gpuDevice) {
                hasError.set("No GPU found. You need a browser that supports WebGPU. This demo only works in Chrome version 114+ on Desktop computers.");
                return;
            }

            const hyperparamsArray = new Float32Array(Object.values(hyperparams));
            const gpuSetup = await setup(gpuDevice, { hyperparamsArray, universeArray })

            await update(gpuStore => {
                if (!gpuStore.device) return gpuStore;

                const newStore: CompleteGpuStore = {
                    device: gpuStore.device,
                    hyperparameters: hyperparams,
                    storageBuffers: gpuSetup.storageBuffers,
                    outputBuffers: gpuSetup.outputBuffers,
                    pipelines: gpuSetup.pipelines,
                }

                return newStore;
            })

            isLoading.reset();
            hasError.reset();
        },
        iterate: async (amount: number) => {
            isLoading.set("Iterating to next generation");

            const store = get(gpuStore);

            if (!("outputBuffers" in store)) {
                hasError.set("GPU not initialized. Please reload the page.")
                return;
            }

            // TODO: do this work in service worker
            const outputBuffers = await iterate(amount, store)

            update(updateStore => {
                if (!("outputBuffers" in updateStore)) {
                    hasError.set("GPU was gone while iterating. Please reload the page.")
                    return updateStore;
                }

                updateStore.hyperparameters.iterations += amount;
                return updateStore;
            })

            isLoading.reset();
            return outputBuffers;
        },
        reset: () => set({ device: null })
    };
}

export function isCompleteGpuStore(store: GPUStore): store is CompleteGpuStore {
    return "device" in store && "storageBuffers" in store;
}

/**
 * The global GPU store.
 * This store is used to keep track of the GPU device and the state of the GPU.
 * 
 * This store has 5 main methods:
 * - `init`: initializes the GPU device
 * - `setup`: sets up the GPU with the hyperparameters and the universe
 * - `iterate`: iterates the GPU with the amount of iterations
 * - `reset`: resets the GPU store
 * - `subscribe`: subscribes to the GPU store
 * 
 * The GPU store has 3 states:
 * - `device: null`: the GPU is not initialized
 * - `device: GPUDevice`: the GPU is initialized
 * - `CompleteGpuStore`: the GPU is initialized and setup
 * 
 * The `CompleteGpuStore` has the following properties:
 * - `device`: the GPU device
 * - `pipelines`: the pipelines used for the GPU
 * - `hyperparameters`: the hyperparameters used for the GPU
 * - `inputBuffers`: the input buffers used for the GPU
 * - `outputBuffers`: the output buffers used for the GPU
 * 
 */
export const gpuStore = createGpuStore();