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
  const { 
    setIsOnline, 
    setFontsLoaded, 
    offlineQueue, 
    clearOfflineQueue, 
    loadPersistedState,
    isOnline 
  } = useAppStore();
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded, fontsError] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // 1. Load persisted auth/language state on mount
  useEffect(() => {
    let isMounted = true;
    async function prepare() {
      try {
        await loadPersistedState();
      } catch (e) {
        console.warn('Failed preparing app state:', e);
      } finally {
        if (isMounted) {
          setAppIsReady(true);
        }
      }
    }
    prepare();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Hide splash screen when fonts are loaded and app is ready
  const fontsFinished = !!(fontsLoaded || fontsError);

  useEffect(() => {
    if (fontsFinished && appIsReady) {
      setFontsLoaded(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsFinished, appIsReady]);

  // 3. Fail-safe timer: guarantee app loads even if font loading stalls
  useEffect(() => {
    if (appIsReady) {
      const fallbackTimer = setTimeout(() => {
        setFontsLoaded(true);
        SplashScreen.hideAsync().catch(() => {});
      }, 3000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [appIsReady]);

  // 4. Network connectivity monitoring (Subscribe once on mount)
  useEffect(() => {
    if (!NetInfo || typeof NetInfo.addEventListener !== 'function') {
      console.warn('NetInfo native module is not available');
      return;
    }

    try {
      const unsubscribe = NetInfo.addEventListener((state) => {
        const online = state.isConnected ?? false;
        setIsOnline(online);
      });
      return unsubscribe;
    } catch (e) {
      console.error('Failed to subscribe to NetInfo:', e);
    }
  }, []);

  // 5. Flush offline queue on reconnect
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      let isCurrent = true;
      flushOfflineQueue(offlineQueue)
        .then(() => {
          if (isCurrent) {
            clearOfflineQueue();
          }
        })
        .catch((err) => {
          console.error('Failed flushing offline queue:', err);
        });
      return () => {
        isCurrent = false;
      };
    }
  }, [isOnline, offlineQueue]);

  if (!appIsReady || (!fontsLoaded && !fontsError)) {
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
        <Stack.Screen name="chat" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="help" />
      </Stack>
    </>
  );
}
