import { writable } from 'svelte/store';

function createUniverseStore() {
    const { subscribe, set } = writable<Universe>(undefined);

    return {
        subscribe,
        update: async () => {
            try {

                const response = await fetch('http://localhost:8080/v1/3d/agent-nodes', {
                    method: 'GET'
                });

                const json: Universe = await response.json();
                console.log({ json })
                set(json)
            } catch (e: any) {
                set(undefined);
            }
        },
        setup: async (size: number, agents: number) => {
            const response = await fetch(`http://localhost:8080/v1/3d/setup/${size}/${agents}`, { method: 'POST' });
            console.log({ response })
            universeStore.update();
        },
        increment: async (amount: number) => {
            const response = await fetch(`http://localhost:8080/v1/3d/iterate?amount=${amount}`, {
                method: 'POST'
            });

            let body = await response.text();
            console.log("increment", { body })
            universeStore.update();
        }
    };
}

export const universeStore = createUniverseStore();