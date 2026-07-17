import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColors } from '@/hooks/useColors';
import { useColorScheme } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
}

export function GlassCard({ children, style, intensity = 40, padding = 16 }: GlassCardProps) {
  const colors = useColors();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View style={[styles.wrapper, { borderRadius: colors.radius, borderColor: colors.border }, style]}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFill, { borderRadius: colors.radius }]}
      />
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(13,13,22,0.6)' : 'rgba(255,255,255,0.7)', borderRadius: colors.radius }]} />
      <View style={{ padding, zIndex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
