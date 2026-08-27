import { useEffect } from 'react';
import { View, Text, Animated, Image } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.9);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();

    // Navigate after 2.5s
    const timer = setTimeout(() => {
      router.replace('/language');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFF8F6',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center', gap: 12 }}>
        {/* Logo mark */}
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 24,
            backgroundColor: '#B5502F',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: '#E4D8C3',
          }}
        >
          <Image
            source={require('../assets/icon.png')}
            style={{ width: 90, height: 90 }}
            resizeMode="cover"
          />
        </View>

        {/* Brand name */}
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 36,
            color: '#2B2420',
            letterSpacing: -0.5,
          }}
        >
          ShilpSetu
        </Text>

        {/* Tagline */}
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 15,
            color: '#56423C',
            letterSpacing: 0.5,
          }}
        >
          Craft · Connect · Commerce
        </Text>
      </Animated.View>

      {/* AI badge at bottom */}
      <Animated.View
        style={{
          opacity,
          position: 'absolute',
          bottom: 52,
          alignItems: 'center',
          gap: 6,
        }}
      >
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: '#5B6E4E',
            backgroundColor: 'rgba(91,110,78,0.06)',
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              color: '#5B6E4E',
            }}
          >
            AI-Powered Marketplace
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            color: '#8A726B',
          }}
        >
          Connecting 10 lakh+ Indian artisans
        </Text>
      </Animated.View>
    </View>
  );
}
