import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import { settingsService } from '../services/settings';

interface SettingsContextType {
    settings: SystemSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: null,
    loading: true,
    refreshSettings: async () => { },
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const data = await settingsService.getSettings();
            setSettings(data);
            if (data) {
                applyVisualIdentity(data);
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyVisualIdentity = (settings: SystemSettings) => {
        document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
        document.documentElement.style.setProperty('--color-secondary', settings.secondaryColor);
        document.title = `${settings.appName} - Solutions Solaires`;
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
