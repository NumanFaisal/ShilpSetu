import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { AIBadge } from '../../components/ui/AIBadge';
import { Card } from '../../components/ui/Card';
import { getAIPricing } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { PRODUCT } from '../../mocks/seed';

export default function PricingScreen() {
  const { draftProduct, updateDraftProduct, isOnline } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [aiPricing, setAiPricing] = useState<any>(null);
  const [price, setPrice] = useState('899');

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const result = await getAIPricing({
        name: draftProduct.name || PRODUCT.name,
        category: draftProduct.category || PRODUCT.category,
        material: draftProduct.material || PRODUCT.material,
        quantity: draftProduct.quantity || 10,
      });
      setAiPricing(result);
      setPrice(String(result.suggested));
    } catch {
      setPrice('899');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    updateDraftProduct({ price: parseInt(price) });
    router.push('/(artisan-flow)/publish-success');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Set Price" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 20, gap: 20 }}>
          {/* Price input */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#2B2420' }}>Your Price</Text>
              {aiPricing && <AIBadge label="AI Suggested" />}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1.5, borderColor: '#B5502F', backgroundColor: '#FFFDF8', overflow: 'hidden' }}>
              <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#F6EEDF', borderRightWidth: 1, borderRightColor: '#E4D8C3' }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 22, color: '#B5502F' }}>₹</Text>
              </View>
              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
                style={{ flex: 1, paddingHorizontal: 16, fontFamily: 'Inter_600SemiBold', fontSize: 28, color: '#2B2420' }}
                placeholder="0"
              />
              <Text style={{ paddingHorizontal: 16, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>per unit</Text>
            </View>
          </View>

          {/* AI pricing card */}
          {loading ? (
            <Card><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>Analysing market prices...</Text></Card>
          ) : aiPricing && (
            <Card>
              <View style={{ gap: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}>AI Price Analysis</Text>
                  <AIBadge label="AI Insight" variant="insight" />
                </View>

                {/* Price range */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ gap: 2, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Min</Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#2B2420' }}>₹{aiPricing.min}</Text>
                  </View>
                  <View style={{ gap: 2, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#5B6E4E', textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggested</Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#B5502F' }}>₹{aiPricing.suggested}</Text>
                  </View>
                  <View style={{ gap: 2, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Max</Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#2B2420' }}>₹{aiPricing.max}</Text>
                  </View>
                </View>

                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C', lineHeight: 20 }}>{aiPricing.reasoning}</Text>
                <View style={{ backgroundColor: 'rgba(91,110,78,0.06)', borderRadius: 8, borderWidth: 1, borderColor: '#5B6E4E', padding: 12 }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#5B6E4E', lineHeight: 18 }}>{aiPricing.marketInsight}</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Offline note */}
          {!isOnline && (
            <View style={{ backgroundColor: 'rgba(181,80,47,0.06)', borderRadius: 8, borderWidth: 1, borderColor: '#B5502F', padding: 12 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#B5502F' }}>
                You are offline. Your product will be saved locally and published when you reconnect.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Button label={isOnline ? 'Publish Product 🚀' : 'Save Offline 📥'} onPress={handlePublish} />
      </View>
    </SafeAreaView>
  );
}
