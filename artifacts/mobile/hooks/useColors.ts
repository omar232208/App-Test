/**
 * Returns the design tokens for the current resolved theme.
 * Reads from ThemeContext (user preference) with system-scheme fallback.
 */
import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';
import { ThemeContext } from '@/context/ThemeContext';

export function useColors() {
  const system = useColorScheme();
  const theme  = useContext(ThemeContext);

  const resolved: 'dark' | 'light' = theme
    ? theme.resolvedTheme
    : (system === 'light' ? 'light' : 'dark');

  const palette = resolved === 'dark' ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
