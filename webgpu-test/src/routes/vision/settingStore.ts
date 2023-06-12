import { writable } from "svelte/store";

type Settings = {
    darkMode: "dark" | "light" | "auto";
    orderScale: "logarithmic" | "linear";
}

let defaultSettings: Settings = {
    darkMode: "auto",
    orderScale: "logarithmic",
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
        set: (key: keyof Settings, value: string) => {
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