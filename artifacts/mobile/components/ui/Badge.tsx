import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'default', style, size = 'sm' }: BadgeProps) {
  const colors = useColors();

  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    default: { bg: colors.muted, text: colors.mutedForeground },
    primary: { bg: colors.secondary, text: colors.primary },
    success: { bg: '#16a34a22', text: colors.success },
    warning: { bg: '#d97706222', text: colors.warning },
    error: { bg: '#ef444422', text: colors.destructive },
    info: { bg: '#3b82f622', text: colors.info },
  };

  const { bg, text } = variantColors[variant];
  const fontSize = size === 'sm' ? 10 : 12;
  const paddingH = size === 'sm' ? 8 : 10;
  const paddingV = size === 'sm' ? 3 : 5;

  return (
    <View style={[styles.badge, { backgroundColor: bg, paddingHorizontal: paddingH, paddingVertical: paddingV, borderRadius: 100 }, style]}>
      <Text style={{ color: text, fontSize, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
