import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Home'     }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
      <Tabs.Screen name="ai"       options={{ title: 'AI'       }} />
      <Tabs.Screen name="library"  options={{ title: 'Library'  }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile'  }} />
      {/* Hide old notes route */}
      <Tabs.Screen name="notes"    options={{ href: null }}        />
    </Tabs>
  );
}
