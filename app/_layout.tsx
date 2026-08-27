import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { useAppStore } from '../store/useAppStore';
import { flushOfflineQueue } from '../services/api';
import '../global.css';

// Safely prevent splash autohide without breaking if native module fails
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { setIsOnline, setFontsLoaded, offlineQueue, clearOfflineQueue, loadPersistedState } = useAppStore();
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Load persisted auth/language state & set fallback timeout for fonts
  useEffect(() => {
    async function prepare() {
      try {
        await loadPersistedState();
      } catch (e) {
        console.warn('Failed preparing app state:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();

    // Fail-safe timer: guarantee app loads even if font network/decoding stalls
    const fallbackTimer = setTimeout(() => {
      setAppIsReady(true);
      setFontsLoaded(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 1000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      setFontsLoaded(true);
      setAppIsReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  // Network connectivity monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);

      // Flush offline queue on reconnect
      if (online && offlineQueue.length > 0) {
        flushOfflineQueue(offlineQueue).then(() => {
          clearOfflineQueue();
        });
      }
    });
    return unsubscribe;
  }, [offlineQueue]);

  if (!appIsReady && !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FFF8F6' }} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFF8F6' } }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="language" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(artisan-onboarding)" />
        <Stack.Screen name="(artisan)" />
        <Stack.Screen name="(artisan-flow)" />
        <Stack.Screen name="(buyer)" />
        <Stack.Screen name="bulk-request" />
        <Stack.Screen name="chat/[threadId]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="help" />
      </Stack>
    </>
  );
}
