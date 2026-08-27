import { useEffect } from 'react';
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

// Keep splash screen visible until fonts + state are ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setIsOnline, setFontsLoaded, offlineQueue, clearOfflineQueue, loadPersistedState } = useAppStore();

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Load persisted auth/language state
  useEffect(() => {
    loadPersistedState();
  }, []);

  // Font loading gate — hide splash when fonts are ready
  useEffect(() => {
    if (fontsLoaded) {
      setFontsLoaded(true);
      SplashScreen.hideAsync();
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

  if (!fontsLoaded) {
    return null; // Splash screen remains visible
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
