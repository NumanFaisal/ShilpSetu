import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { AIBadge } from '../../components/ui/AIBadge';
import { Card } from '../../components/ui/Card';
import { getAIPricing, publishProduct, type PriceListingSource } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { PRODUCT } from '../../mocks/seed';
import { Sparkles, ShieldCheck, ShoppingBag, Search, Globe, Coins, ExternalLink, CheckCircle2 } from 'lucide-react-native';

export default function PricingScreen() {
  const { draftProduct, updateDraftProduct, isOnline } = useAppStore();
  
  // 1. User inputs for product and labour costs first
  const [materialCost, setMaterialCost] = useState('450');
  const [labourCost, setLabourCost] = useState('550');

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [aiPricing, setAiPricing] = useState<any>(null);
  const [price, setPrice] = useState('1450');

  const rawImage = draftProduct.images?.[0] || PRODUCT.images?.[0];
  const rawImageStr = typeof rawImage === 'string' ? rawImage.trim() : (rawImage as any)?.uri || (rawImage as any)?.url || '';
  const productImage = typeof rawImageStr === 'string' ? rawImageStr : '';
  const productName = typeof draftProduct.name === 'string' && draftProduct.name.trim().length > 0 
    ? draftProduct.name 
    : ((draftProduct.name as any)?.en || PRODUCT.name || 'Handmade Craft');
  const productCategory = typeof draftProduct.category === 'string' && draftProduct.category.trim().length > 0 
    ? draftProduct.category 
    : (PRODUCT.category || 'Handicraft');
  const productMaterial = typeof draftProduct.material === 'string' && draftProduct.material.trim().length > 0 
    ? draftProduct.material 
    : (PRODUCT.material || '');

  const numericMaterial = parseInt(materialCost, 10) || 0;
  const numericLabour = parseInt(labourCost, 10) || 0;
  const totalBaseCost = numericMaterial + numericLabour;

  // Search internet for real product prices
  const searchMarketPrices = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const result = await getAIPricing({
        name: productName,
        category: productCategory,
        material: productMaterial,
        materialCost: numericMaterial,
        labourCost: numericLabour,
        quantity: draftProduct.quantity || 1,
      });
      if (result) {
        setAiPricing(result);
        if (result.suggested) {
          setPrice(String(result.suggested));
        }
      }
    } catch (err: any) {
      console.warn('[Pricing] Market search error:', err?.message);
      const estBase = totalBaseCost || 1000;
      setPrice(String(Math.round(estBase * 1.35)));
    } finally {
      setLoading(false);
    }
  };

  // Perform initial search on mount so artisan has instant context
  useEffect(() => {
    searchMarketPrices();
  }, []);

  const handlePublish = async () => {
    setPublishing(true);
    const numericPrice = parseInt(price, 10) || totalBaseCost || 1450;
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

  const isImageValid = Boolean(productImage) && (
    productImage.startsWith('http://') ||
    productImage.startsWith('https://') ||
    productImage.startsWith('file:') ||
    productImage.startsWith('data:') ||
    productImage.startsWith('/')
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Cost & Market Pricing" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 16, gap: 20 }}>

          {/* Product Summary Preview Card */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E8DED8', padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            {isImageValid ? (
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
                {Boolean(productMaterial) && (
                  <View style={{ backgroundColor: '#F0EBE5', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B5952' }}>{productMaterial}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ─────────────────────────────────────────────────────────────
              STEP 1: USER INPUTS PRODUCT COST & LABOUR COST FIRST
             ───────────────────────────────────────────────────────────── */}
          <Card>
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Coins size={18} color="#B5502F" />
                  <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 17, color: '#2B2420' }}>
                    1. Enter Production Costs
                  </Text>
                </View>
                <AIBadge label="Step 1" variant="insight" />
              </View>

              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#66534C', lineHeight: 18 }}>
                Provide your raw material and labour expenses. AI will search the live internet to find real market prices for this exact product.
              </Text>

              {/* Input Cost of Product */}
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#2B2420' }}>
                    Input Cost of Product (Materials)
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B' }}>
                    Raw materials, fabric, clay, etc.
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1.5, borderColor: '#D9C8BE', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F6EEDF', borderRightWidth: 1, borderRightColor: '#E4D8C3' }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#B5502F' }}>₹</Text>
                  </View>
                  <TextInput
                    value={materialCost}
                    onChangeText={setMaterialCost}
                    keyboardType="number-pad"
                    style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 8, fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#2B2420' }}
                    placeholder="450"
                  />
                  <Text style={{ paddingHorizontal: 12, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>per unit</Text>
                </View>
              </View>

              {/* Labour Cost */}
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#2B2420' }}>
                    Artisan Labour Cost
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B' }}>
                    Time, effort & skill
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1.5, borderColor: '#D9C8BE', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F6EEDF', borderRightWidth: 1, borderRightColor: '#E4D8C3' }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#B5502F' }}>₹</Text>
                  </View>
                  <TextInput
                    value={labourCost}
                    onChangeText={setLabourCost}
                    keyboardType="number-pad"
                    style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 8, fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#2B2420' }}
                    placeholder="550"
                  />
                  <Text style={{ paddingHorizontal: 12, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>per unit</Text>
                </View>
              </View>

              {/* Cost Summary Bar */}
              <View style={{ backgroundColor: '#F8F6F2', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E8E2DA' }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#56423C' }}>
                  Your Total Base Cost:
                </Text>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#2B2420' }}>
                  ₹{totalBaseCost}
                </Text>
              </View>

              {/* Action Button: Search Internet for Real Product Prices */}
              <TouchableOpacity
                onPress={searchMarketPrices}
                disabled={loading}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#B5502F',
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' }}>
                      Searching Internet for Real Prices...
                    </Text>
                  </>
                ) : (
                  <>
                    <Search size={18} color="#FFFFFF" />
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' }}>
                      {hasSearched ? 'Re-Search Real Market Prices 🔍' : 'Search Internet for Real Prices 🔍'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Card>

          {/* ─────────────────────────────────────────────────────────────
              STEP 2: REAL INTERNET SEARCH RESULTS (MIN & MAX COST)
             ───────────────────────────────────────────────────────────── */}
          {loading ? (
            <Card>
              <View style={{ padding: 16, alignItems: 'center', gap: 12 }}>
                <ActivityIndicator color="#B5502F" size="large" />
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420', textAlign: 'center' }}>
                  Searching Real Market Listings...
                </Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#66534C', textAlign: 'center', lineHeight: 18 }}>
                  Scanning Amazon, Flipkart, Meesho & Etsy for "{productName}" to extract genuine minimum and maximum prices.
                </Text>
              </View>
            </Card>
          ) : aiPricing && (
            <Card>
              <View style={{ gap: 16 }}>
                {/* Header with Live Status */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Globe size={18} color="#5B6E4E" />
                    <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 17, color: '#2B2420' }}>
                      2. Real Market Analysis
                    </Text>
                  </View>
                  <AIBadge
                    label={aiPricing.pricingSource === 'live_search' ? 'Real Web Data' : 'Benchmark Data'}
                    variant={aiPricing.pricingSource === 'live_search' ? 'insight' : 'suggested'}
                  />
                </View>

                {/* Real Min / Suggested / Max 3-Tier Grid */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FDFBF7', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E8DED8' }}>
                  {/* Real Minimum Cost */}
                  <View style={{ gap: 4, alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#8A726B', textTransform: 'uppercase' }}>
                      Real Min Cost
                    </Text>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#2B2420' }}>
                      ₹{aiPricing.min ?? 0}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: '#8A726B', textAlign: 'center' }}>
                      Lowest found online
                    </Text>
                  </View>

                  {/* Suggested Selling Price */}
                  <View style={{ gap: 4, alignItems: 'center', flex: 1.2, backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: '#B5502F' }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: '#B5502F', textTransform: 'uppercase' }}>
                      Fair Retail
                    </Text>
                    <Text style={{ fontFamily: 'Inter_800Bold', fontSize: 22, color: '#B5502F' }}>
                      ₹{aiPricing.suggested ?? 0}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: '#5B6E4E', textAlign: 'center' }}>
                      Fair Artisan Profit
                    </Text>
                  </View>

                  {/* Real Maximum Cost */}
                  <View style={{ gap: 4, alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#8A726B', textTransform: 'uppercase' }}>
                      Real Max Cost
                    </Text>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#2B2420' }}>
                      ₹{aiPricing.max ?? 0}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: '#8A726B', textAlign: 'center' }}>
                      Highest found online
                    </Text>
                  </View>
                </View>

                {/* Real Web Listings Discovered (Real Not AI Generated) */}
                {Array.isArray(aiPricing.sources) && aiPricing.sources.length > 0 && (
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#2B2420' }}>
                        Real Listings Found Online (Not AI Generated)
                      </Text>
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#5B6E4E' }}>
                        {aiPricing.sources.length} Verified
                      </Text>
                    </View>

                    <View style={{ gap: 6 }}>
                      {aiPricing.sources.slice(0, 4).map((src: PriceListingSource, idx: number) => {
                        if (!src) return null;
                        return (
                          <View
                            key={idx}
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: '#E8DED8',
                              padding: 10,
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <View style={{ flex: 1, gap: 2 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={{ backgroundColor: '#FDF2EE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#B5502F' }}>
                                    {src.marketplace || 'Online'}
                                  </Text>
                                </View>
                                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#2B2420' }} numberOfLines={1}>
                                  {src.title || 'Market Item'}
                                </Text>
                              </View>
                            </View>
                            {src.extractedPrice != null && (
                              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#2B2420' }}>
                                ₹{src.extractedPrice}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Cost & Fair Profit Margin Breakdown */}
                <View style={{ backgroundColor: '#F8F6F2', borderRadius: 10, padding: 14, gap: 10, borderWidth: 1, borderColor: '#E8E2DA' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#2B2420' }}>
                    Cost & Profit Margin Breakdown
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#66534C' }}>Your Material Cost</Text>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>₹{numericMaterial}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#66534C' }}>Your Labour Cost</Text>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>₹{numericLabour}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#DDD6CC' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={16} color="#5B6E4E" />
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#5B6E4E' }}>Your Net Profit Margin</Text>
                    </View>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#5B6E4E' }}>
                      +₹{Math.max(0, (parseInt(price, 10) || Number(aiPricing.suggested) || 0) - totalBaseCost)}
                    </Text>
                  </View>
                </View>

                {/* Reasoning Description */}
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C', lineHeight: 20 }}>
                  {aiPricing.reasoning}
                </Text>
              </View>
            </Card>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 3: FINAL SELLING PRICE CONFIRMATION
             ───────────────────────────────────────────────────────────── */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#2B2420' }}>
                3. Final Selling Price
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>
                Artisan Editable
              </Text>
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
                placeholder="1450"
              />
              <Text style={{ paddingHorizontal: 16, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>per piece</Text>
            </View>
          </View>

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
