import * as alt from 'alt-client'

export interface SettingsAPI {
    get<T>(module: string, key: string, defaultValue: T): T;
    set<T>(module: string, key: string, value: T): void;
    getAll(module: string): Record<string, any>;
    onChange(module: string, callback: (settings: Record<string, any>) => void): void;
    offChange(module: string, callback: Function): void;
}

class ClientSettingsManager implements SettingsAPI {
    private listeners: Map<string, Set<Function>> = new Map();

    get<T>(module: string, key: string, defaultValue: T): T {
        try {
            const moduleData = alt.LocalStorage.get(`settings_${module}`);
            if (moduleData) {
                const parsed = JSON.parse(moduleData);
                return parsed[key] ?? defaultValue;
            }
        } catch (e) {
            console.error(`[Settings API] Failed to get ${module}.${key}: `, e);
        }
        return defaultValue;
    }
    set<T>(module: string, key: string, value: T): void {
        try {
            let moduleData = {};
            const stored = alt.LocalStorage.get(`settings_${module}`);
            if (stored) {
                moduleData = JSON.parse(stored);
            }
            moduleData[key] = value;
            alt.LocalStorage.set(`settings_${module}`, JSON.stringify(moduleData));
            alt.LocalStorage.save();

            this.notifyListeners(module, moduleData);
        } catch (e) {
            console.error(`[Settings API] Failed to set ${module}.${key}: `, e);
        }
    }
    getAll<T>(module: string): Record<string, any> {
        try {
            const stored = alt.LocalStorage.get(`settings_${module}`);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error(`[Settings API] Failed to getAll ${module}: `, e);
        }
        return {};
    }
    onChange(module: string, callback: (settings: Record<string, any>) => void): void {
        if (!this.listeners.has(module)) {
            this.listeners.set(module, new Set());
        }
        this.listeners.get(module)!.add(callback);
    }
    offChange(module: string, callback: Function): void {
        this.listeners.get(module)?.delete(callback);
    }


    private notifyListeners(module: string, settings: Record<string, any>) : void {
        this.listeners.get(module)?.forEach(callback => callback(settings));
    }
}

export const settingsAPI = new ClientSettingsManager();