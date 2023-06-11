import { writable } from "svelte/store";

type Settings = {
    darkMode: "dark" | "light" | "auto";
}

let defaultSettings: Settings = {
    darkMode: "auto",
}

function createSettingStore() {
    const { subscribe, set, update } = writable<Settings>(defaultSettings);

    return {
        subscribe,
        setup: () => {
            let settings = localStorage?.getItem("settings");

            if (settings) set(JSON.parse(settings));
        },
        set: (key: keyof Settings, value: any) => {
            update((settings) => {
                settings[key] = value;

                console.log(key, value)

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