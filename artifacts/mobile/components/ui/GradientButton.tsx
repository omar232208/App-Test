import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GradientButton({
  label, onPress, style, loading = false, variant = 'primary', size = 'md', disabled = false
}: GradientButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }

  async function handlePress() {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const height = size === 'sm' ? 40 : size === 'lg' ? 58 : 50;
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  if (variant === 'ghost') {
    return (
      <AnimatedPressable
        style={[animStyle, styles.ghost, { borderColor: colors.border, borderRadius: colors.radius, height }, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
      >
        <Text style={{ color: colors.foreground, fontSize, fontFamily: 'Inter_600SemiBold' }}>{label}</Text>
      </AnimatedPressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <AnimatedPressable
        style={[animStyle, styles.ghost, {
          borderColor: colors.primary,
          borderRadius: colors.radius,
          height,
          backgroundColor: colors.secondary,
        }, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
      >
        <Text style={{ color: colors.primary, fontSize, fontFamily: 'Inter_600SemiBold' }}>{label}</Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={[animStyle, { borderRadius: colors.radius, overflow: 'hidden', height }, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={disabled ? ['#555', '#444'] : [colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { height }]}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={{ color: '#fff', fontSize, fontFamily: 'Inter_600SemiBold' }}>{label}</Text>
        }
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
