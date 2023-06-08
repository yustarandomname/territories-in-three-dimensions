import { writable } from "svelte/store";

type Settings = {
    darkMode: boolean;
}

let defaultSettings: Settings = {
    darkMode: true,
}

function createSettingStore() {
    const { subscribe, set, update } = writable<Settings>(defaultSettings);

    return {
        subscribe,
        set: (key: keyof Settings, value: any) => {
            update((settings) => {
                settings[key] = value;
                return settings;
            })

        },
        reset: () => set(defaultSettings)
    };
}

export const settingStore = createSettingStore();