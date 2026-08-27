import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppStore } from '../store/useAppStore';

export default function Index() {
  const { isAuthenticated, userRole, isFontsLoaded } = useAppStore();

  if (!isFontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FFF8F6' }} />;
  }

  if (isAuthenticated && userRole === 'artisan') {
    return <Redirect href="/(artisan)/home" />;
  }

  if (isAuthenticated && userRole === 'buyer') {
    return <Redirect href="/(buyer)/home" />;
  }

  return <Redirect href="/splash" />;
}
