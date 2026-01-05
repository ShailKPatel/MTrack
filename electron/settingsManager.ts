import fs from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';

export interface AppSettings {
    currency: string;
    currencyLocale: string;
    theme: 'dark' | 'light';
    isFirstRun: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
    currency: 'USD',
    currencyLocale: 'en-US',
    theme: 'dark',
    isFirstRun: true,
};

export class SettingsManager {
    private path: string;
    private settings: AppSettings;

    constructor(userDataPath: string) {
        this.path = path.join(userDataPath, 'settings.json');
        this.settings = { ...DEFAULT_SETTINGS };
    }

    async init() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
        } catch {
            // File doesn't exist, save defaults
            await this.save();
        }
    }

    get(): AppSettings {
        return this.settings;
    }

    async update(newSettings: Partial<AppSettings>) {
        this.settings = { ...this.settings, ...newSettings };
        await this.save();
        return this.settings;
    }

    private async save() {
        await fs.writeFile(this.path, JSON.stringify(this.settings, null, 2), 'utf-8');
    }
}
