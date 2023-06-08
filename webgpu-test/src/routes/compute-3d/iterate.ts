import type { CompleteGpuStore } from "../vision/gpuStore";

export default async function iterate(amount: number, { device, pipelines, hyperparameters, storageBuffers, outputBuffers }: CompleteGpuStore) {
    const encoder = device.createCommandEncoder();
    const HYPERPARAMS = { ...hyperparameters };
    const dispatchWorkgroups = Math.ceil(Math.pow(HYPERPARAMS.size, 3) / 100); //TODO: make this hyperparam

    // Setup pipeline
    console.time(`Time to iterate: ${amount}`);
    for (let i = 0; i < amount; i++) {
        const pass = encoder.beginComputePass();
        pass.setPipeline(pipelines['update_graffiti_and_push_strength'].pipeline);
        pass.setBindGroup(
            0,
            pipelines['update_graffiti_and_push_strength'].bindGroups[HYPERPARAMS.iterations % 2]
        );
        pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

        pass.setPipeline(pipelines['move_agents_out'].pipeline);
        pass.setBindGroup(0, pipelines['move_agents_out'].bindGroups[HYPERPARAMS.iterations % 2]);
        pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);

        pass.setPipeline(pipelines['move_agents_in'].pipeline);
        pass.setBindGroup(0, pipelines['move_agents_in'].bindGroups[HYPERPARAMS.iterations % 2]);
        pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);
        HYPERPARAMS.iterations++;
        pass.end();
    }

    // // Calculate order parameter
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipelines['calculate_order_param'].pipeline);
    pass.setBindGroup(0, pipelines['calculate_order_param'].bindGroups[HYPERPARAMS.iterations % 2]);
    pass.dispatchWorkgroups(dispatchWorkgroups, 1, 1);
    pass.end();

    // Move storage buffers to result buffers
    encoder.copyBufferToBuffer(
        storageBuffers.cellStateStorage[(HYPERPARAMS.iterations + 1) % 2],
        0,
        outputBuffers.resultBuffer,
        0,
        outputBuffers.resultBuffer.size
    );
    encoder.copyBufferToBuffer(
        storageBuffers.orderBuffer,
        0,
        outputBuffers.orderResultBuffer,
        0,
        outputBuffers.orderResultBuffer.size
    );

    // Finish encoding and submit the commands
    device.queue.submit([encoder.finish()]);
    console.timeEnd(`Time to iterate: ${amount}`);

    // Read results
    await outputBuffers.resultBuffer.mapAsync(GPUMapMode.READ);
    const result = new Float32Array(outputBuffers.resultBuffer.getMappedRange().slice(0));
    outputBuffers.resultBuffer.unmap();

    await outputBuffers.orderResultBuffer.mapAsync(GPUMapMode.READ);
    const orderResult = new Float32Array(outputBuffers.orderResultBuffer.getMappedRange().slice(0));
    outputBuffers.orderResultBuffer.unmap();

    return { result, orderResult };
}