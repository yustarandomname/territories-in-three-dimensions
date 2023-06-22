import { writable } from "svelte/store";

export type GpuStore = {
    device: GPUDevice;
    adapter: GPUAdapter;
    module: GPUShaderModule;
    buffers: { label: string, buffer: GPUBuffer }[];
    pipelines: { pipeLine: GPUComputePipeline, bindGroup: GPUBindGroup }[];
};

type GpuFunction = (gpu: GpuStore) => void;
type ModuleFunction = (gpu: GpuStore) => GPUShaderModule;

let bindGroupEntries: GPUBindGroupLayoutEntry[] = [];
let bindGroupLayout: GPUBindGroupLayout;

function addToBindGroup(type: GPUBufferBindingType, device: GPUDevice) {
    bindGroupEntries.push({
        binding: bindGroupEntries.entries.length,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type }
    })

    bindGroupLayout = device.createBindGroupLayout({
        label: "bind-group-layout",
        entries: bindGroupEntries
    });
}

function createGpuStore() {
    const { subscribe, set, update } = writable<GpuStore | undefined>(undefined);

    return {
        subscribe,
        update: (fn: GpuFunction) => update(n => {
            if (n == undefined) return undefined;
            fn(n);
            return n
        }),
        addShaderModule: (fn: ModuleFunction) => update(n => {
            if (n == undefined) return undefined;
            n.module = fn(n);
            return n;
        }),
        init: (gpu: GpuStore) => set(gpu),
        addBuffer: (buffer: GPUBuffer, type: GPUBufferBindingType, label: string) => update(n => {
            if (n == undefined) return undefined;
            n.buffers.push({ label, buffer });
            addToBindGroup(type, n.device);
            return n;
        }),
        addResultBuffer: (buffer: GPUBuffer) => update(n => {
            console.log("Do something with result buffer");
            return n;
        }),
        reset: () => set(undefined),
        getBindGroupLayout: () => bindGroupLayout
    };
}

export default createGpuStore();