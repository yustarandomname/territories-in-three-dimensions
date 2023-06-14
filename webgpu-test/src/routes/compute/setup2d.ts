import type { HyperParameters } from '../vision/gpuStore';
import computeShader from './computeShader.wgsl?raw';

type PipelineNames = "update_graffiti_and_push_strength" | "move_agents_out" | "move_agents_in" | "calculate_order_param";
export type Pipeline = {
    [key in PipelineNames]: PipelineBind;
};
type PipelineBind = { pipeline: GPUComputePipeline, bindGroups: readonly [GPUBindGroup, GPUBindGroup] };

export type OutputBuffers = { resultBuffer: GPUBuffer, orderResultBuffer: GPUBuffer }
export type StorageBuffers = {
    cellStateStorage: readonly [GPUBuffer, GPUBuffer];
    agentsOutBuffers: readonly [GPUBuffer, GPUBuffer];
    orderBuffer: GPUBuffer;
}
export type InputBuffers = { hyperparamsArray: Float32Array, universeArray: Float32Array };

export type GpuSetup = {
    pipelines: Pipeline;
    outputBuffers: OutputBuffers;
    storageBuffers: StorageBuffers
}


export default async function setup2D(device: GPUDevice, buffers: InputBuffers, hyperparameters: HyperParameters): Promise<GpuSetup> {
    const module = device.createShaderModule({
        label: 'compute module',
        code: computeShader
    });

    const total_size = Math.pow(hyperparameters.size, 2);

    const input = buffers.universeArray;

    // Create a uniform buffer that describes the grid hyper paramets.
    const uniformArray = buffers.hyperparamsArray
    const uniformBuffer = device.createBuffer({
        label: 'Grid Uniforms',
        size: uniformArray.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    // create a buffer on the GPU to hold our computation input as ping pong buffers
    const cellStateStorage = [
        device.createBuffer({
            label: 'Cell State A',
            size: input.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
        }),
        device.createBuffer({
            label: 'Cell State B',
            size: input.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
        })
    ] as const;

    // Copy our input data to that the first buffer
    device.queue.writeBuffer(cellStateStorage[0], 0, input);

    const agentsOutArray = new Float32Array(input.length); // TODO: This might not be the right size
    // Create a buffer for storing the amount of agents moving out
    const agentsOutBuffers = [
        device.createBuffer({
            label: 'Agents Out red',
            size: agentsOutArray.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        }),
        device.createBuffer({
            label: 'Agents Out blue',
            size: agentsOutArray.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })
    ] as const;
    device.queue.writeBuffer(agentsOutBuffers[0], 0, agentsOutArray);
    device.queue.writeBuffer(agentsOutBuffers[1], 0, new Float32Array(input.length));

    // create a buffer on the GPU to get a copy of the results
    const resultBuffer = device.createBuffer({
        label: 'result buffer',
        size: input.byteLength,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    });

    // create a buffer on the GPU to get the current order parameter
    const orderArray = new Float32Array(total_size);
    const orderBuffer = device.createBuffer({
        label: 'order buffer',
        size: orderArray.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    });

    const orderResultBuffer = device.createBuffer({
        label: 'order result buffer',
        size: orderArray.byteLength,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    });

    const bindGroupLayout = device.createBindGroupLayout({
        label: 'Cell Bind Group Layout',
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: 'uniform' } // Grid uniform buffer
            },
            {
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: 'read-only-storage' } // Cell state input buffer
            },
            {
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: 'storage' } // Cell red agent neighbours buffer
            },
            {
                binding: 3,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: 'storage' } // Cell blue agent neighbours buffer
            },
            {
                binding: 4,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: 'storage' } // Cell state output buffer
            },
            {
                binding: 5,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: 'storage' } // Cell state order parameter buffer
            }
        ]
    });



    function createPipeline(entryPoint: PipelineNames, device: GPUDevice) {
        const pipelineLayout = device.createPipelineLayout({
            label: 'Cell Pipeline Layout',
            bindGroupLayouts: [bindGroupLayout]
        });

        const computePipeline = device.createComputePipeline({
            label: `${entryPoint} pipeline`,
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint
            }
        });

        // Setup a bindGroup to tell the shader which buffer to use for the computation
        // For each iterations we need to swap the input and output buffers
        const bindGroups = [
            device.createBindGroup({
                label: `BindGroup for ${entryPoint}, group A`,
                layout: bindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: uniformBuffer }
                    },
                    {
                        binding: 1,
                        resource: { buffer: cellStateStorage[0] } // Cell state A buffer
                    },
                    {
                        binding: 2,
                        resource: { buffer: cellStateStorage[1] } // Cell state B buffer
                    },
                    {
                        binding: 3,
                        resource: { buffer: agentsOutBuffers[0] }
                    },
                    {
                        binding: 4,
                        resource: { buffer: agentsOutBuffers[1] }
                    },
                    {
                        binding: 5,
                        resource: { buffer: orderBuffer }
                    }
                ]
            }),
            device.createBindGroup({
                label: `BindGroup for ${entryPoint}, group B`,
                layout: bindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: uniformBuffer }
                    },
                    {
                        binding: 1,
                        resource: { buffer: cellStateStorage[1] } // Cell state B buffer
                    },
                    {
                        binding: 2,
                        resource: { buffer: cellStateStorage[0] } // Cell state A buffer
                    },
                    {
                        binding: 3,
                        resource: { buffer: agentsOutBuffers[0] }
                    },
                    {
                        binding: 4,
                        resource: { buffer: agentsOutBuffers[1] }
                    },
                    {
                        binding: 5,
                        resource: { buffer: orderBuffer }
                    }
                ]
            })
        ] as const;

        return { pipeline: computePipeline, bindGroups };
    }

    let pipelines: Pipeline = {
        update_graffiti_and_push_strength: createPipeline('update_graffiti_and_push_strength', device),
        move_agents_out: createPipeline('move_agents_out', device),
        move_agents_in: createPipeline('move_agents_in', device),
        calculate_order_param: createPipeline('calculate_order_param', device)
    };
    let storageBuffers = { cellStateStorage, agentsOutBuffers, orderBuffer };
    let outputBuffers = { resultBuffer, orderResultBuffer };

    return { pipelines, outputBuffers, storageBuffers }
}