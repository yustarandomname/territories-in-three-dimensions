import { writable } from "svelte/store";
import type { HyperParameters } from "./gpuStore";
import type { Universe } from './../Universe';

export let layoutData = {
    outputUniverse: writable<Universe>(),
    orderParams: writable<{ iter: number; result: number }[]>([]),
    HYPERPARAMS: writable<HyperParameters>(),
    sliceIndex: writable<number>(0),
    iterateStep: writable<number>(0),
};

export type LayoutData = typeof layoutData;