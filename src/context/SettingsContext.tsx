import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AppSettings {
    currency: string;
    currencyLocale: string;
    theme: 'dark' | 'light';
}

interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    formatCurrency: (amount: number) => string;
}

const defaultSettings: AppSettings = {
    currency: 'USD',
    currencyLocale: 'en-US',
    theme: 'dark',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load from backend
        window.ipcRenderer.invoke('get-settings').then(loaded => {
            setSettings(loaded);
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, []);

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        const updated = await window.ipcRenderer.invoke('update-settings', newSettings);
        setSettings(updated);
    };

    const formatCurrency = (amount: number) => {
        if (isLoading) return '...'; // Or basic formatter
        return new Intl.NumberFormat(settings.currencyLocale, {
            style: 'currency',
            currency: settings.currency,
        }).format(amount);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, formatCurrency }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
