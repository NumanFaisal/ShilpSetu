import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { AIBadge } from '../../components/ui/AIBadge';
import { Card } from '../../components/ui/Card';
import { getAIPricing, publishProduct } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { PRODUCT } from '../../mocks/seed';
import { Sparkles, TrendingUp, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react-native';

export default function PricingScreen() {
  const { draftProduct, updateDraftProduct, isOnline } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [aiPricing, setAiPricing] = useState<any>(null);
  const [price, setPrice] = useState('1800');

  const rawImage = draftProduct.images?.[0] || PRODUCT.images?.[0];
  const productImage = typeof rawImage === 'string' ? rawImage : (rawImage as any)?.uri || (rawImage as any)?.url || '';
  const productName = draftProduct.name || PRODUCT.name;
  const productCategory = draftProduct.category || PRODUCT.category;
  const productMaterial = draftProduct.material || PRODUCT.material;

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const result = await getAIPricing({
        name: productName,
        category: productCategory,
        material: productMaterial,
        quantity: draftProduct.quantity || 1,
      });
      setAiPricing(result);
      if (result.suggested) {
        setPrice(String(result.suggested));
      }
    } catch (err: any) {
      console.warn('[Pricing] Fallback price estimate:', err?.message);
      setPrice('1800');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    const numericPrice = parseInt(price) || 1800;
    updateDraftProduct({ price: numericPrice });

    try {
      const res = await publishProduct(
        {
          ...draftProduct,
          price: numericPrice,
        },
        { isOffline: !isOnline }
      );
      if (res?.productId) {
        updateDraftProduct({ id: res.productId } as any);
      }
    } catch (err) {
      console.warn('[Pricing] Publish sync offline fallback:', err);
    } finally {
      setPublishing(false);
      router.push('/(artisan-flow)/publish-success');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="AI Pricing & Margins" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 16, gap: 18 }}>

          {/* Product Summary Preview Card */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E8DED8', padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            {productImage ? (
              <Image source={{ uri: productImage }} style={{ width: 68, height: 68, borderRadius: 8, backgroundColor: '#F6EEDF' }} resizeMode="cover" />
            ) : (
              <View style={{ width: 68, height: 68, borderRadius: 8, backgroundColor: '#F6EEDF', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={24} color="#8A726B" />
              </View>
            )}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }} numberOfLines={1}>
                {productName}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <View style={{ backgroundColor: '#F6EEDF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#56423C' }}>{productCategory}</Text>
                </View>
                {productMaterial && (
                  <View style={{ backgroundColor: '#F0EBE5', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B5952' }}>{productMaterial}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Price input section */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#2B2420' }}>
                Selling Price
              </Text>
              {aiPricing && <AIBadge label="AI Calibrated" />}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 2, borderColor: '#B5502F', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
              <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FDF2EE', borderRightWidth: 1, borderRightColor: '#F0D4CB' }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 24, color: '#B5502F' }}>₹</Text>
              </View>
              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
                style={{ flex: 1, paddingHorizontal: 16, fontFamily: 'Inter_600SemiBold', fontSize: 26, color: '#2B2420' }}
                placeholder="1800"
              />
              <Text style={{ paddingHorizontal: 16, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>per piece</Text>
            </View>
          </View>

          {/* AI Pricing Analysis Card */}
          {loading ? (
            <Card>
              <View style={{ padding: 12, alignItems: 'center', gap: 10 }}>
                <ActivityIndicator color="#B5502F" size="small" />
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#56423C', textAlign: 'center' }}>
                  Analyzing national e-commerce rates & raw material costs...
                </Text>
              </View>
            </Card>
          ) : aiPricing && (
            <Card>
              <View style={{ gap: 16 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} color="#B5502F" />
                    <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 17, color: '#2B2420' }}>
                      AI Price Analysis
                    </Text>
                  </View>
                  <AIBadge label="Fair Margin" variant="insight" />
                </View>

                {/* Price Range Tiers */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FDFBF7', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E8DED8' }}>
                  <View style={{ gap: 3, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#8A726B', textTransform: 'uppercase' }}>Min Retail</Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#2B2420' }}>₹{aiPricing.min}</Text>
                  </View>
                  <View style={{ gap: 3, alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#B5502F' }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#B5502F', textTransform: 'uppercase' }}>Recommended</Text>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: '#B5502F' }}>₹{aiPricing.suggested}</Text>
                  </View>
                  <View style={{ gap: 3, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#8A726B', textTransform: 'uppercase' }}>Max Retail</Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#2B2420' }}>₹{aiPricing.max}</Text>
                  </View>
                </View>

                {/* Fair Margin Breakdown */}
                {aiPricing.marginBreakdown && (
                  <View style={{ backgroundColor: '#F8F6F2', borderRadius: 10, padding: 14, gap: 10, borderWidth: 1, borderColor: '#E8E2DA' }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#2B2420' }}>
                      Cost & Profit Breakdown
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#66534C' }}>Raw Materials</Text>
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>₹{aiPricing.marginBreakdown.materialCost || 400}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#66534C' }}>Artisan Labor & Skill</Text>
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>₹{aiPricing.marginBreakdown.laborCost || 800}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#DDD6CC' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <ShieldCheck size={16} color="#5B6E4E" />
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#5B6E4E' }}>Your Net Profit</Text>
                      </View>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#5B6E4E' }}>
                        +₹{aiPricing.marginBreakdown.artisanProfit || 400}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Marketplace Comparison Benchmarks */}
                {aiPricing.marketplaceBreakdown && (
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#2B2420' }}>
                      Marketplace Averages
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {aiPricing.marketplaceBreakdown.map((m: any, idx: number) => (
                        <View key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E8DED8', paddingHorizontal: 10, paddingVertical: 6, gap: 2 }}>
                          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#8A726B' }}>{m.marketplace}</Text>
                          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#2B2420' }}>₹{m.avgPrice}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Reasoning Description */}
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C', lineHeight: 20 }}>
                  {aiPricing.reasoning}
                </Text>
              </View>
            </Card>
          )}

          {/* Offline note */}
          {!isOnline && (
            <View style={{ backgroundColor: 'rgba(181,80,47,0.06)', borderRadius: 8, borderWidth: 1, borderColor: '#B5502F', padding: 12 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#B5502F' }}>
                You are offline. Your product will be saved locally and published when reconnected.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Button
          label={publishing ? 'Publishing Everywhere...' : (isOnline ? 'Publish Product Everywhere 🚀' : 'Save Offline 💾')}
          onPress={handlePublish}
        />
      </View>
    </SafeAreaView>
  );
}
