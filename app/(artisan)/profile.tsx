import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Settings, HelpCircle, Star, ChevronRight, LogOut } from 'lucide-react-native';
import { Header } from '../../components/ui/Header';
import { useAppStore } from '../../store/useAppStore';
import { ARTISAN, SAMPLE_PRODUCTS } from '../../mocks/seed';

export default function ArtisanProfileScreen() {
  const { logout } = useAppStore();
  const artisan = ARTISAN;

  const handleLogout = () => {
    logout();
    router.replace('/welcome');
  };

  const menuItems = [
    { icon: Settings, label: 'Settings', onPress: () => router.push('/settings') },
    { icon: HelpCircle, label: 'Help & Support', onPress: () => router.push('/help') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Profile" showBack={false} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 16, alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F6EEDF', borderWidth: 2, borderColor: '#B5502F', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 32 }}>🧶</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#2B2420' }}>{artisan.name}</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C' }}>{artisan.location}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Star size={14} color="#B5502F" fill="#B5502F" />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>{artisan.rating}</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>({artisan.reviewCount} reviews)</Text>
            </View>
          </View>

          {/* Craft tags */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {artisan.crafts.map((craft) => (
              <View key={craft} style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, backgroundColor: 'rgba(181,80,47,0.08)', borderWidth: 1, borderColor: '#B5502F' }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#B5502F' }}>{craft}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', overflow: 'hidden' }}>
          {[
            { value: artisan.productsCount, label: 'Products' },
            { value: artisan.experience, label: 'Yrs Experience' },
            { value: artisan.reviewCount, label: 'Reviews' },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: '#E4D8C3', backgroundColor: '#FFFDF8' }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#B5502F' }}>{stat.value}</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        <View style={{ marginHorizontal: 20, marginTop: 20, gap: 8 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}>About</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', lineHeight: 22 }}>{artisan.bio}</Text>
        </View>

        {/* Portfolio preview */}
        <View style={{ marginTop: 20, gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420', paddingHorizontal: 20 }}>Portfolio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {SAMPLE_PRODUCTS.filter((p) => p.images.length > 0).map((p) => (
              <Image key={p.id} source={{ uri: p.images[0] }} style={{ width: 100, height: 100, borderRadius: 10, backgroundColor: '#F6EEDF' }} />
            ))}
          </ScrollView>
        </View>

        {/* Menu */}
        <View style={{ marginHorizontal: 20, marginTop: 24, gap: 0, borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', overflow: 'hidden', backgroundColor: '#FFFDF8' }}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#E4D8C3' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <item.icon size={18} color="#56423C" strokeWidth={1.5} />
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2B2420' }}>{item.label}</Text>
              </View>
              <ChevronRight size={16} color="#B8A9A5" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 20, marginTop: 8 }}
        >
          <LogOut size={18} color="#9C4A3C" strokeWidth={1.5} />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: '#9C4A3C' }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
