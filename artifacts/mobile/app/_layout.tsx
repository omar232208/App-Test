import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AgentsProvider } from '@/context/AgentsContext';
import { ActivityProvider } from '@/context/ActivityContext';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

try { SplashScreen.preventAutoHideAsync(); } catch (e) { console.warn('SplashScreen init error:', e); }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 },
    mutations: { retry: 1 },
  },
});

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index"  options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  try {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <DataProvider>
                  <AgentsProvider>
                    <ActivityProvider>
                      {children}
                    </ActivityProvider>
                  </AgentsProvider>
                </DataProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  } catch (e) {
    console.error('Provider render error:', e);
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#05050A' }}>
        <Text style={{ color: '#EF4444', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>Failed to initialize</Text>
      </View>
    );
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{initError}</Text>
      </View>
    );
  }

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#05050A' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#05050A', padding: 24 },
  errorTitle: { color: '#EF4444', fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  errorText: { color: '#ffffff88', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
