import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { Header } from '../../components/ui/Header';
import { ShuttleIcon, PotterWheelIcon, LeafIcon } from '../../components/icons/CraftIcons';

const OPTIONS = [
  {
    icon: Camera,
    title: 'Take New Photos',
    subtitle: 'Use your camera to photograph the product. AI will enhance and remove background.',
    action: () => router.push('/(artisan-flow)/camera'),
    primary: true,
  },
  {
    icon: ImageIcon,
    title: 'Use Existing Photos',
    subtitle: 'Pick photos from your gallery. AI will process and optimise them.',
    action: () => router.push('/(artisan-flow)/image-processing'),
    primary: false,
  },
];

export default function AddProductScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Add Product" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, gap: 24 }}>
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#2B2420', lineHeight: 36 }}>
            How would you{'\n'}like to start?
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#56423C', lineHeight: 22 }}>
            Our AI will help write the product description and set the right price automatically.
          </Text>
        </View>

        {/* Options */}
        <View style={{ gap: 14 }}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.title}
              onPress={opt.action}
              activeOpacity={0.8}
              style={{
                backgroundColor: opt.primary ? '#B5502F' : '#FFFDF8',
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: opt.primary ? '#B5502F' : '#E4D8C3',
                padding: 20,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: opt.primary ? 'rgba(255,255,255,0.2)' : 'rgba(181,80,47,0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <opt.icon size={22} color={opt.primary ? '#FFFFFF' : '#B5502F'} strokeWidth={1.5} />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: opt.primary ? '#FFFFFF' : '#2B2420' }}>
                  {opt.title}
                </Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: opt.primary ? 'rgba(255,255,255,0.85)' : '#56423C', lineHeight: 18 }}>
                  {opt.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Process steps */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}>How it works</Text>
          {[
            { step: '1', label: 'Photograph your product', icon: '📸' },
            { step: '2', label: 'AI enhances the photo', icon: '✨' },
            { step: '3', label: 'Describe in your language', icon: '🎙️' },
            { step: '4', label: 'AI generates catalog & pricing', icon: '🤖' },
            { step: '5', label: 'Review and publish', icon: '🚀' },
          ].map((s) => (
            <View key={s.step} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(181,80,47,0.08)', borderWidth: 1, borderColor: '#E4D8C3', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#B5502F' }}>{s.step}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C' }}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
