import React from 'react';
import { View, Text, Image, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../components/ui/Button';
import { AIBadge } from '../components/ui/AIBadge';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image area */}
        <View
          style={{
            height: 340,
            backgroundColor: '#F6EEDF',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          {/* Warm overlay */}
          <View
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(181,80,47,0.15)',
            }}
          />
          {/* Brand mark */}
          <View
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
            }}
          >
            <Text
              style={{
                fontFamily: 'Fraunces_600SemiBold',
                fontSize: 28,
                color: '#FFFFFF',
                textShadowColor: 'rgba(43,36,32,0.4)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              ShilpSetu
            </Text>
          </View>
          {/* AI badge on image */}
          <View style={{ position: 'absolute', bottom: 20, left: 24 }}>
            <AIBadge label="AI-Powered Marketplace" />
          </View>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 24, paddingTop: 32, gap: 12 }}>
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 32,
              color: '#2B2420',
              lineHeight: 40,
            }}
          >
            India's craft{'\n'}marketplace
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 16,
              color: '#56423C',
              lineHeight: 24,
            }}
          >
            Connect artisans with buyers across India. List your crafts, find bulk buyers, and grow your business with AI-powered insights.
          </Text>

          {/* Stats */}
          <View
            style={{
              flexDirection: 'row',
              gap: 0,
              marginVertical: 8,
            }}
          >
            {[
              { value: '10L+', label: 'Artisans' },
              { value: '50K+', label: 'Buyers' },
              { value: '₹200Cr+', label: 'Trade Value' },
            ].map((stat, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 16,
                  borderWidth: 1,
                  borderColor: '#E4D8C3',
                  backgroundColor: '#FFFDF8',
                  borderRadius: i === 0 ? 12 : i === 2 ? 12 : 0,
                  borderLeftWidth: i === 0 ? 1 : 0,
                  borderRightWidth: i === 2 ? 1 : 0,
                  marginLeft: i === 0 ? 0 : -1,
                  gap: 2,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 20,
                    color: '#B5502F',
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: '#8A726B',
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={{ paddingHorizontal: 24, gap: 12, marginTop: 8 }}>
          <Button
            label="I'm an Artisan 🧶"
            onPress={() => router.push('/(auth)/artisan-login')}
            variant="primary"
            size="lg"
          />
          <Button
            label="I'm a Buyer 🏢"
            onPress={() => router.push('/(auth)/buyer-login')}
            variant="secondary"
            size="lg"
          />
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: '#8A726B',
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            By continuing, you agree to ShilpSetu's Terms of Service
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
