import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

interface TabConfig {
  name:    string;
  label:   string;
  icon:    string;
}

const TABS: TabConfig[] = [
  { name: 'index',     label: 'Home',     icon: 'home'          },
  { name: 'projects',  label: 'Projects', icon: 'folder'        },
  { name: 'ai',        label: 'AI',       icon: 'cpu'           },
  { name: 'community', label: 'Community',icon: 'message-circle'},
  { name: 'library',   label: 'Library',  icon: 'book-open'     },
  { name: 'profile',   label: 'Profile',  icon: 'user'          },
];

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter(r => {
    const desc = descriptors[r.key];
    const opts = desc.options as Record<string, unknown>;
    return opts.href !== null && opts.tabBarButton !== (() => null);
  });

  return (
    <View style={[styles.root, { height: 56 + insets.bottom, backgroundColor: colors.background + 'F0' }]}>
      <View style={[styles.border, { backgroundColor: colors.border }]} />
      <View style={[styles.row, { paddingBottom: insets.bottom }]}>
        {TABS.map((tabConfig) => {
          const route = state.routes.find(r => r.name === tabConfig.name);
          if (!route) return null;
          const isFocused = state.index === state.routes.indexOf(route);
          const { options } = descriptors[route.key];
          if ((options as any).href === null) return null;

          return (
            <Pressable
              key={tabConfig.name}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              onLongPress={() => { navigation.emit({ type: 'tabLongPress', target: route.key }); }}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tabConfig.label}
            >
              <View style={[styles.pill, isFocused && { backgroundColor: colors.primary + '20' }]} />
              <Feather name={tabConfig.icon as any} size={22} color={isFocused ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.label, { color: isFocused ? colors.primary : colors.mutedForeground, fontFamily: isFocused ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                {tabConfig.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden' },
  border: { position: 'absolute', top: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth },
  row: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', paddingTop: 6, paddingHorizontal: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  pill: { position: 'absolute', top: 0, left: 8, right: 8, height: 34, borderRadius: 12 },
  label: { fontSize: 10, letterSpacing: 0.1, marginTop: 2 },
});
