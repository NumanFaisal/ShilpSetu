import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Settings, HelpCircle, ChevronRight, LogOut, Star } from 'lucide-react-native';
import { Header } from '../../components/ui/Header';
import { useAppStore } from '../../store/useAppStore';
import { BUYER } from '../../mocks/seed';

export default function BuyerProfileScreen() {
  const { logout } = useAppStore();
  const buyer = BUYER;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Profile" showBack={false} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 16, alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#D1E6BF', borderWidth: 2, borderColor: '#5B6E4E', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 32 }}>🏢</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#2B2420' }}>{buyer.companyName}</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C' }}>{buyer.location}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 9999, backgroundColor: 'rgba(91,110,78,0.1)', borderWidth: 1, borderColor: '#5B6E4E' }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#5B6E4E' }}>Verified Buyer</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', overflow: 'hidden' }}>
          {[
            { value: buyer.totalOrders, label: 'Total Orders' },
            { value: buyer.artisansConnected, label: 'Artisans' },
            { value: buyer.activeRequests, label: 'Requests' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: '#E4D8C3', backgroundColor: '#FFFDF8' }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#5B6E4E' }}>{s.value}</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        <View style={{ marginHorizontal: 20, marginTop: 20, gap: 8 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}>About</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', lineHeight: 22 }}>{buyer.bio}</Text>
        </View>

        {/* Preferences */}
        <View style={{ marginHorizontal: 20, marginTop: 20, gap: 8 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}>Sourcing Preferences</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {buyer.preferences.map((p) => (
              <View key={p} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, backgroundColor: 'rgba(91,110,78,0.08)', borderWidth: 1, borderColor: '#5B6E4E' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#5B6E4E' }}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu */}
        <View style={{ marginHorizontal: 20, marginTop: 24, borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', overflow: 'hidden', backgroundColor: '#FFFDF8' }}>
          {[
            { Icon: Settings, label: 'Settings', onPress: () => router.push('/settings') },
            { Icon: HelpCircle, label: 'Help & Support', onPress: () => router.push('/help') },
          ].map((item, i) => (
            <TouchableOpacity key={item.label} onPress={item.onPress} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#E4D8C3' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <item.Icon size={18} color="#56423C" strokeWidth={1.5} />
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2B2420' }}>{item.label}</Text>
              </View>
              <ChevronRight size={16} color="#B8A9A5" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={() => { logout(); router.replace('/welcome'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 20 }}>
          <LogOut size={18} color="#9C4A3C" strokeWidth={1.5} />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: '#9C4A3C' }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
