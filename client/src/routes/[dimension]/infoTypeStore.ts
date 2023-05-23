import { writable } from "svelte/store";

export enum InfoType {
    Agents = 'agent',
    Graffiti = 'graffiti',
}


export const infoTypeStore = writable<InfoType>(InfoType.Agents);