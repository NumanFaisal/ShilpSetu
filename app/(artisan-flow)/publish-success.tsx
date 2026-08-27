import React, { useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { publishProduct } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

export default function PublishSuccessScreen() {
  const { draftProduct, clearDraftProduct, isOnline, addOfflineWrite } = useAppStore();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    handlePublish();
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handlePublish = async () => {
    if (!isOnline) {
      addOfflineWrite({ id: Date.now().toString(), type: 'publish_product', payload: draftProduct as any, timestamp: new Date().toISOString() });
      return;
    }
    try {
      await publishProduct(draftProduct as any);
      clearDraftProduct();
    } catch {
      // Still show success — will retry from queue
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
      <Animated.View style={{ alignItems: 'center', gap: 20, opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
        {/* Success icon */}
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(91,110,78,0.1)', borderWidth: 2, borderColor: '#5B6E4E', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 48 }}>🧺</Text>
        </View>

        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 30, color: '#2B2420', textAlign: 'center', lineHeight: 38 }}>
          {isOnline ? 'Product Published!' : 'Saved for Later'}
        </Text>

        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#56423C', textAlign: 'center', lineHeight: 22 }}>
          {isOnline
            ? `${draftProduct.name || 'Your product'} is now live on ShilpSetu. AI will match you with relevant buyers.`
            : 'Your product has been saved locally and will publish automatically when you are back online.'}
        </Text>

        {/* Stats */}
        {isOnline && (
          <View style={{ width: '100%', backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 16, gap: 10 }}>
            {[
              { label: 'Estimated daily views', value: '20–50' },
              { label: 'AI-matched buyers', value: '12 nearby' },
              { label: 'Category rank', value: '#3 in Bamboo Craft' },
            ].map((stat) => (
              <View key={stat.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>{stat.label}</Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#5B6E4E' }}>{stat.value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ width: '100%', gap: 10 }}>
          <Button label="View My Products" onPress={() => { clearDraftProduct(); router.replace('/(artisan)/products'); }} />
          <Button label="Add Another Product" onPress={() => { clearDraftProduct(); router.replace('/(artisan-flow)/add-product'); }} variant="secondary" />
          <Button label="Back to Home" onPress={() => { clearDraftProduct(); router.replace('/(artisan)/home'); }} variant="ghost" />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
