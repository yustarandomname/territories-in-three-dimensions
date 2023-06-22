import { writable } from "svelte/store";

export type AutoPlaySteps = { id: string; steps: number; amount: number }[]

export type Settings = {
    darkMode: "dark" | "light" | "auto";
    orderScale: "logarithmic" | "linear";
    densityType: "relative" | "absolute",
    autoPlaySteps: AutoPlaySteps;
    autoPlayBetas: number[];
}

let defaultAutoPlaySteps: AutoPlaySteps = [
    { id: '1', steps: 1, amount: 25 },
    { id: '10', steps: 10, amount: 10 },
    { id: '100', steps: 100, amount: 10 },
    { id: '400', steps: 400, amount: 3 },
    { id: '1000', steps: 1000, amount: 2 }
]


let defaultSettings: Settings = {
    darkMode: "auto",
    orderScale: "logarithmic",
    densityType: "absolute",
    autoPlaySteps: defaultAutoPlaySteps,
    autoPlayBetas: [1e-5]
}

function createSettingStore() {
    const { subscribe, set, update } = writable<Settings>(defaultSettings);

    return {
        subscribe,
        setup: () => {
            let settings = localStorage?.getItem("settings");

            if (settings) {
                set({ ...defaultSettings, ...JSON.parse(settings) });
            }
        },
        set: <K extends keyof Settings>(key: K, value: Settings[K]) => {
            update((settings) => {
                settings[key] = value;

                localStorage?.setItem("settings", JSON.stringify(settings));

                return settings;
            })
        },
        reset: () => {
            set(defaultSettings)
            localStorage?.removeItem("settings");
        }
    };
}

export const settingStore = createSettingStore();