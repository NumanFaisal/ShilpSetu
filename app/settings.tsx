import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Header } from '../components/ui/Header';
import { useAppStore } from '../store/useAppStore';
import { LANGUAGES } from '../mocks/seed';

export default function SettingsScreen() {
  const { selectedLanguage, setSelectedLanguage, userRole, logout } = useAppStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  const currentLangLabel = LANGUAGES.find((l) => l.code === selectedLanguage)?.label || 'English';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Settings" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 24 }} showsVerticalScrollIndicator={false}>
        {/* App Preferences */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Preferences</Text>
          <View style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', overflow: 'hidden' }}>
            {/* Language */}
            <TouchableOpacity
              onPress={() => router.push('/language')}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E4D8C3' }}
            >
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2B2420' }}>App Language</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#B5502F' }}>{currentLangLabel} →</Text>
            </TouchableOpacity>

            {/* Notifications toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E4D8C3' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2B2420' }}>Push Notifications</Text>
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#E4D8C3', true: '#B5502F' }} thumbColor="#FFFFFF" />
            </View>

            {/* Offline sync toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2B2420' }}>Auto-sync when online</Text>
              <Switch value={offlineSync} onValueChange={setOfflineSync} trackColor={{ false: '#E4D8C3', true: '#B5502F' }} thumbColor="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Account information */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Account</Text>
          <View style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 16, gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>Account Type</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420', textTransform: 'capitalize' }}>{userRole || 'Artisan'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>Registered Phone</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>+91 98765 43210</Text>
            </View>
          </View>
        </View>

        {/* About App */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>About ShilpSetu AI</Text>
          <View style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 16, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>Version</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>1.0.0 (Expo SDK 57)</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>Design System</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>Stitch Terracotta & Ivory</Text>
            </View>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          onPress={() => { logout(); router.replace('/welcome'); }}
          style={{ backgroundColor: 'rgba(156,74,60,0.08)', borderRadius: 8, borderWidth: 1, borderColor: '#9C4A3C', paddingVertical: 14, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: '#9C4A3C' }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
