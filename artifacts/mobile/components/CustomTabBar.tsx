/**
 * CustomTabBar — Apple-style tab bar with rounded-rect active indicator.
 * Matches the iOS 18 tab bar aesthetic: icon+pill on active, label below.
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

interface TabConfig {
  name:      string;
  label:     string;
  sfSymbol:  string;
  sfActive:  string;
  feather:   string;
}

const TABS: TabConfig[] = [
  { name: 'index',    label: 'Home',     sfSymbol: 'house',             sfActive: 'house.fill',           feather: 'home'      },
  { name: 'projects', label: 'Projects', sfSymbol: 'folder',            sfActive: 'folder.fill',          feather: 'folder'    },
  { name: 'ai',       label: 'AI',       sfSymbol: 'cpu',               sfActive: 'cpu.fill',             feather: 'cpu'       },
  { name: 'library',  label: 'Library',  sfSymbol: 'books.vertical',    sfActive: 'books.vertical.fill',  feather: 'book-open' },
  { name: 'profile',  label: 'Profile',  sfSymbol: 'person.circle',     sfActive: 'person.circle.fill',   feather: 'user'      },
];

/* ── Animated pill behind active icon ──────────────────────────── */
function TabItem({
  config, isFocused, onPress, onLongPress,
}: {
  config: TabConfig; isFocused: boolean; onPress: () => void; onLongPress: () => void;
}) {
  const colors  = useColors();
  const { resolvedTheme } = useTheme();
  const isDark  = resolvedTheme === 'dark';
  const isIOS   = Platform.OS === 'ios';

  // Scale animation on press
  const scale   = useRef(new Animated.Value(1)).current;
  // Pill opacity animation
  const pillOp  = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pillOp, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  }, [isFocused]);

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }
  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  }

  const activeColor   = colors.primary;
  const inactiveColor = isDark ? '#636375' : '#8E8E93';
  const iconColor     = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={config.label}
    >
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        {/* Active pill background */}
        <Animated.View
          style={[
            styles.pill,
            {
              backgroundColor: isFocused
                ? (isDark ? colors.primary + '28' : colors.primary + '18')
                : 'transparent',
              opacity: pillOp,
            },
          ]}
        />

        {/* Icon */}
        <View style={styles.iconWrap}>
          {isIOS ? (
            <SymbolView
              name={(isFocused ? config.sfActive : config.sfSymbol) as any}
              tintColor={iconColor}
              size={24}
              animationSpec={isFocused ? { effect: { type: 'bounce' } } : undefined}
            />
          ) : (
            <Feather name={config.feather as any} size={22} color={iconColor} />
          )}
        </View>

        {/* Label */}
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? activeColor : inactiveColor,
              fontFamily: isFocused ? 'Inter_600SemiBold' : 'Inter_400Regular',
            },
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/* ── Main bar ───────────────────────────────────────────────────── */
export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { resolvedTheme } = useTheme();
  const isDark  = resolvedTheme === 'dark';
  const isIOS   = Platform.OS === 'ios';

  // Filter out hidden routes (e.g. notes with href:null)
  const visibleRoutes = state.routes.filter(r => {
    const desc = descriptors[r.key];
    const opts = desc.options as Record<string, unknown>;
    return opts.href !== null && opts.tabBarButton !== (() => null);
  });

  const barHeight = 56 + insets.bottom;

  return (
    <View style={[styles.root, { height: barHeight }]}>
      {/* Background: blur on iOS, solid on Android/web */}
      {isIOS ? (
        <BlurView
          intensity={85}
          tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterial'}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? 'rgba(10,10,20,0.97)' : 'rgba(248,248,252,0.97)' },
          ]}
        />
      )}

      {/* Hairline separator */}
      <View style={[styles.border, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)' }]} />

      {/* Tabs row */}
      <View style={[styles.row, { paddingBottom: insets.bottom }]}>
        {TABS.map((tabConfig) => {
          const route = state.routes.find(r => r.name === tabConfig.name);
          if (!route) return null;

          const isFocused = state.index === state.routes.indexOf(route);
          const { options } = descriptors[route.key];

          // Skip hidden tabs
          if ((options as any).href === null) return null;

          return (
            <TabItem
              key={tabConfig.name}
              config={tabConfig}
              isFocused={isFocused}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              onLongPress={() => {
                navigation.emit({ type: 'tabLongPress', target: route.key });
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    gap: 3,
    width: '100%',
  },
  pill: {
    position: 'absolute',
    top: -4,
    left: 8,
    right: 8,
    height: 34,
    borderRadius: 12,
  },
  iconWrap: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.1,
    marginTop: 1,
  },
});
