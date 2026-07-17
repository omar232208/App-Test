/**
 * ThemeContext — manages app theme (dark / light / system) and user preferences.
 * Exports the raw ThemeContext for low-level consumption and the ThemeProvider wrapper.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light' | 'system';
export type FontSize  = 'small' | 'default' | 'large';

interface ThemeSettings {
  theme:         ThemeMode;
  fontSize:      FontSize;
  compact:       boolean;
  notifications: boolean;
  emailDigest:   boolean;
}

export interface ThemeContextType extends ThemeSettings {
  resolvedTheme:    'dark' | 'light';
  setTheme:         (t: ThemeMode) => void;
  setFontSize:      (f: FontSize)  => void;
  setCompact:       (v: boolean)   => void;
  setNotifications: (v: boolean)   => void;
  setEmailDigest:   (v: boolean)   => void;
}

const SETTINGS_KEY = '@devos_settings';

const defaults: ThemeSettings = {
  theme:         'dark',
  fontSize:      'default',
  compact:       false,
  notifications: true,
  emailDigest:   false,
};

// Export raw context so useColors can consume it without circular deps
export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<ThemeSettings>(defaults);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then(raw => { if (raw) setSettings({ ...defaults, ...JSON.parse(raw) }); })
      .finally(() => setLoaded(true));
  }, []);

  async function persist(next: ThemeSettings) {
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }

  const resolvedTheme: 'dark' | 'light' =
    settings.theme === 'system'
      ? (systemScheme === 'light' ? 'light' : 'dark')
      : settings.theme;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{
      ...settings,
      resolvedTheme,
      setTheme:         (t) => persist({ ...settings, theme: t }),
      setFontSize:      (f) => persist({ ...settings, fontSize: f }),
      setCompact:       (v) => persist({ ...settings, compact: v }),
      setNotifications: (v) => persist({ ...settings, notifications: v }),
      setEmailDigest:   (v) => persist({ ...settings, emailDigest: v }),
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
