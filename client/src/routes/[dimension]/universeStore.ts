import { writable } from 'svelte/store';

export interface Universes {
    u1?: Universe;
    u2?: Universe;
    u3?: Universe;
}

function createUniverseStore() {
    const { subscribe, update } = writable<Universes>({
        u1: undefined,
        u2: undefined,
        u3: undefined
    });

    return {
        subscribe,
        update: async (dim: number) => {
            try {

                const response = await fetch(`http://localhost:8080/v1/${dim}d/agent-nodes`, {
                    method: 'GET'
                });

                const json: Universe = await response.json();

                update(us => {
                    let index = `u${dim}` as keyof Universes;
                    us[index] = json;
                    return us;
                })
            } catch (e: any) {
                update(us => {
                    let index = `u${dim}` as keyof Universes;
                    us[index] = undefined;
                    return us;
                })
            }
        },
        setup: async (dims: number, size: number, agents: number) => {
            const response = await fetch(`http://localhost:8080/v1/${dims}d/setup/${size}/${agents}`, { method: 'POST' });
            console.log({ response })
            universeStore.update(dims);
        },
        set_parameters: async (dims: number, parameters: HyperParams) => {
            const response = await fetch(`http://localhost:8080/v1/${dims}d/set_params?gamma=${parameters.gamma}&lambda=${parameters.lambda}&beta=${parameters.beta}`, { method: 'POST' });
            const text = await response.text();
            console.log({ text })
            universeStore.update(dims);
        },
        increment: async (dims: number, amount: number) => {
            const response = await fetch(`http://localhost:8080/v1/${dims}d/iterate?amount=${amount}`, {
                method: 'POST'
            });

            let body = await response.text();
            console.log("increment", { body })
            universeStore.update(dims);
        }
    };
}

export const universeStore = createUniverseStore();