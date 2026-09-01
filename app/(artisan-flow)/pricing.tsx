import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, Linking } from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { AIBadge } from '../../components/ui/AIBadge';
import { Card } from '../../components/ui/Card';
import { getAIPricing } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

export default function PricingScreen() {
  const { draftProduct, updateDraftProduct, isOnline } = useAppStore();
  const [materialCost, setMaterialCost] = useState('');
  const [labourHours, setLabourHours] = useState('');
  const [wageRate, setWageRate] = useState('150');
  const [loading, setLoading] = useState(false);
  const [aiPricing, setAiPricing] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState('');

  const fetchPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAIPricing({
        name: draftProduct.name || '',
        category: draftProduct.category || '',
        material: draftProduct.material || '',
        quantity: draftProduct.quantity || 1,
        materialCost: parseFloat(materialCost) || 0,
        labourHours: parseFloat(labourHours) || 0,
        wageRate: parseFloat(wageRate) || 0,
      });
      setAiPricing(result);
      setPrice(String(result.suggested));
    } catch (e: any) {
      setError(e?.message || 'Could not fetch a pricing suggestion.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    const parsed = parseInt(price, 10);
    if (!parsed || parsed <= 0) return;
    updateDraftProduct({ price: parsed });
    router.push('/(artisan-flow)/publish-success');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Set Price" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 20, gap: 20 }}>
          {/* Cost inputs */}
          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Your Costs</Text>

            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>Material Cost (₹)</Text>
              <TextInput
                value={materialCost}
                onChangeText={setMaterialCost}
                keyboardType="number-pad"
                placeholder="e.g. 200"
                style={{ borderWidth: 1, borderColor: '#E4D8C3', borderRadius: 8, backgroundColor: '#FFFDF8', paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_500Medium', fontSize: 16, color: '#2B2420' }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>Labour Hours</Text>
                <TextInput
                  value={labourHours}
                  onChangeText={setLabourHours}
                  keyboardType="number-pad"
                  placeholder="e.g. 4"
                  style={{ borderWidth: 1, borderColor: '#E4D8C3', borderRadius: 8, backgroundColor: '#FFFDF8', paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_500Medium', fontSize: 16, color: '#2B2420' }}
                />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>Wage Rate (₹/hr)</Text>
                <TextInput
                  value={wageRate}
                  onChangeText={setWageRate}
                  keyboardType="number-pad"
                  placeholder="150"
                  style={{ borderWidth: 1, borderColor: '#E4D8C3', borderRadius: 8, backgroundColor: '#FFFDF8', paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_500Medium', fontSize: 16, color: '#2B2420' }}
                />
              </View>
            </View>

            <Button
              label={loading ? 'Analysing Market Prices…' : 'Get AI Price Suggestion'}
              onPress={fetchPricing}
              disabled={loading}
            />
          </View>

          {/* Price input — only shown once we have a suggestion or user wants to set manually */}
          {(aiPricing || price) && (
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
          )}

          {/* Error */}
          {error && (
            <Card>
              <View style={{ gap: 10 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#B5502F' }}>{error}</Text>
                <Button label="Retry" onPress={fetchPricing} variant="secondary" />
              </View>
            </Card>
          )}

          {/* AI pricing analysis card */}
          {aiPricing && !error && (
            <Card>
              <View style={{ gap: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}>AI Price Analysis</Text>
                  <AIBadge label="AI Insight" variant="insight" />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>Your base cost</Text>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2B2420' }}>₹{aiPricing.baseCost}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ gap: 2, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Market Min</Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#2B2420' }}>₹{aiPricing.marketMin}</Text>
                  </View>
                  <View style={{ gap: 2, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#5B6E4E', textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggested</Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#B5502F' }}>₹{aiPricing.suggested}</Text>
                  </View>
                  <View style={{ gap: 2, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Market Max</Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#2B2420' }}>₹{aiPricing.marketMax}</Text>
                  </View>
                </View>

                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C', lineHeight: 20 }}>{aiPricing.reasoning}</Text>

                {aiPricing.sources?.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8A726B' }}>Sources</Text>
                    {aiPricing.sources.map((s: any, i: number) => (
                      <Text
                        key={i}
                        onPress={() => Linking.openURL(s.url)}
                        style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#B5502F', textDecorationLine: 'underline' }}
                        numberOfLines={1}
                      >
                        {s.title || s.url}
                      </Text>
                    ))}
                  </View>
                )}
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
        <Button label={isOnline ? 'Publish Product 🚀' : 'Save Offline 📥'} onPress={handlePublish} disabled={!price} />
      </View>
    </SafeAreaView>
  );
}