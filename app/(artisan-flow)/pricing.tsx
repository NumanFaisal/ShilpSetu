import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { AIBadge } from '../../components/ui/AIBadge';
import { Card } from '../../components/ui/Card';
import { getAIPricing, publishProduct, type PriceListingSource } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { PRODUCT } from '../../mocks/seed';
import {
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  Search,
  Globe,
  Coins,
  ExternalLink,
  CheckCircle2,
  Check,
  Tag,
  TrendingUp,
} from 'lucide-react-native';

export default function PricingScreen() {
  const { draftProduct, updateDraftProduct, isOnline } = useAppStore();

  // 1. Manual Artisan Selling Price (Primary & not overwritten by AI)
  const initialPrice = draftProduct.price ? String(draftProduct.price) : '';
  const [price, setPrice] = useState<string>(initialPrice);
  const [priceAppliedNotice, setPriceAppliedNotice] = useState(false);

  // 2. Production Costs (Materials & Labour for AI context)
  const [materialCost, setMaterialCost] = useState('450');
  const [labourCost, setLabourCost] = useState('550');

  // 3. AI & Market Search State (On-demand only, never on mount)
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiPricing, setAiPricing] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 4. Publishing state
  const [publishing, setPublishing] = useState(false);

  const rawImage = draftProduct.images?.[0] || PRODUCT.images?.[0];
  const rawImageStr =
    typeof rawImage === 'string'
      ? rawImage.trim()
      : (rawImage as any)?.uri || (rawImage as any)?.url || '';
  const productImage = typeof rawImageStr === 'string' ? rawImageStr : '';
  const productName =
    typeof draftProduct.name === 'string' && draftProduct.name.trim().length > 0
      ? draftProduct.name
      : (draftProduct.name as any)?.en || PRODUCT.name || 'Handmade Craft';
  const productCategory =
    typeof draftProduct.category === 'string' && draftProduct.category.trim().length > 0
      ? draftProduct.category
      : PRODUCT.category || 'Handicraft';
  const productMaterial =
    typeof draftProduct.material === 'string' && draftProduct.material.trim().length > 0
      ? draftProduct.material
      : PRODUCT.material || '';

  const numericMaterial = parseInt(materialCost, 10) || 0;
  const numericLabour = parseInt(labourCost, 10) || 0;
  const totalBaseCost = numericMaterial + numericLabour;
  const numericPrice = parseInt(price, 10) || 0;

  // On-demand Tavily & ML search — ONLY triggered when artisan clicks "Get AI Pricing Suggestion"
  const handleGetAIPricing = async () => {
    setLoading(true);
    setSearchError(null);
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
        // Note: Artisan's manual price is explicitly NOT overwritten.
        // The artisan can review the suggestions and choose to apply if desired.
      }
    } catch (err: any) {
      console.warn('[Pricing] Market search error:', err?.message);
      setSearchError(err?.message || 'Unable to fetch market prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Allow artisan to optionally apply AI suggested price to their manual input
  const handleApplySuggestedPrice = () => {
    if (aiPricing?.suggested) {
      setPrice(String(aiPricing.suggested));
      setPriceAppliedNotice(true);
      setTimeout(() => setPriceAppliedNotice(false), 3500);
    }
  };

  // Open verified source link safely in external browser
  const handleOpenSourceUrl = async (rawUrl?: string) => {
    if (!rawUrl) return;
    try {
      let targetUrl = rawUrl.trim();
      if (targetUrl.startsWith('//')) {
        targetUrl = `https:${targetUrl}`;
      } else if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      }

      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        await Linking.openURL(targetUrl);
      }
    } catch (err: any) {
      console.warn('[Pricing] Could not open source URL:', rawUrl, err?.message);
      Alert.alert(
        'Unable to Open Link',
        'Could not open the product link in the browser. Please check your network connection.'
      );
    }
  };

  const handlePublish = async () => {
    if (!numericPrice || numericPrice <= 0) {
      Alert.alert(
        'Selling Price Required',
        'Please enter the price you want to sell your product for before publishing.'
      );
      return;
    }

    setPublishing(true);
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

  const isImageValid =
    Boolean(productImage) &&
    (productImage.startsWith('http://') ||
      productImage.startsWith('https://') ||
      productImage.startsWith('file:') ||
      productImage.startsWith('data:') ||
      productImage.startsWith('/'));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Pricing & Publish" showBack />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingVertical: 16, gap: 20 }}>
          {/* Product Summary Preview Card */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E8DED8',
              padding: 12,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
            }}
          >
            {isImageValid ? (
              <Image
                source={{ uri: productImage }}
                style={{ width: 68, height: 68, borderRadius: 8, backgroundColor: '#F6EEDF' }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 8,
                  backgroundColor: '#F6EEDF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={24} color="#8A726B" />
              </View>
            )}
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}
                numberOfLines={1}
              >
                {productName}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <View
                  style={{
                    backgroundColor: '#F6EEDF',
                    borderRadius: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#56423C' }}>
                    {productCategory}
                  </Text>
                </View>
                {Boolean(productMaterial) && (
                  <View
                    style={{
                      backgroundColor: '#F0EBE5',
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B5952' }}>
                      {productMaterial}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 1: MANUAL ARTISAN PRICE (ENTERED FIRST & PROTECTED)
             ───────────────────────────────────────────────────────────── */}
          <Card>
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Tag size={18} color="#B5502F" />
                  <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>
                    1. Your Selling Price
                  </Text>
                </View>
                <AIBadge label="Artisan Owned" variant="suggested" />
              </View>

              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#66534C', lineHeight: 18 }}>
                Enter the price you want to sell your product for. This is your personal decision and will{' '}
                <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#2B2420' }}>
                  never be automatically overwritten
                </Text>{' '}
                by AI.
              </Text>

              {/* Artisan's Price Input */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#B5502F',
                  backgroundColor: '#FFFFFF',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    backgroundColor: '#FDF2EE',
                    borderRightWidth: 1,
                    borderRightColor: '#F0D4CB',
                  }}
                >
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 24, color: '#B5502F' }}>
                    ₹
                  </Text>
                </View>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="number-pad"
                  style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontFamily: 'Inter_700Bold',
                    fontSize: 26,
                    color: '#2B2420',
                  }}
                  placeholder="e.g. 1200"
                  placeholderTextColor="#A8968F"
                />
                <Text style={{ paddingHorizontal: 16, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#8A726B' }}>
                  per unit
                </Text>
              </View>

              {priceAppliedNotice && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#EBF3E6',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: '#C2DEC0',
                  }}
                >
                  <Check size={14} color="#386A34" />
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#386A34' }}>
                    Applied AI suggested price of ₹{aiPricing?.suggested} to your selling price.
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 2: PRODUCTION COSTS & AI PRICING SUGGESTION TRIGGER
             ───────────────────────────────────────────────────────────── */}
          <Card>
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Coins size={18} color="#5B6E4E" />
                  <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 17, color: '#2B2420' }}>
                    2. AI Market Research
                  </Text>
                </View>
                <AIBadge label="Optional" variant="insight" />
              </View>

              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#66534C', lineHeight: 18 }}>
                Want to check real market rates? Enter your production expenses below and click the button to search live e-commerce listings via Tavily.
              </Text>

              {/* Input Cost of Product */}
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#2B2420' }}>
                    Material Cost
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B' }}>
                    Fabric, clay, paint, etc.
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: '#D9C8BE',
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: '#F6EEDF',
                      borderRightWidth: 1,
                      borderRightColor: '#E4D8C3',
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#B5502F' }}>
                      ₹
                    </Text>
                  </View>
                  <TextInput
                    value={materialCost}
                    onChangeText={setMaterialCost}
                    keyboardType="number-pad"
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 16,
                      color: '#2B2420',
                    }}
                    placeholder="450"
                  />
                  <Text style={{ paddingHorizontal: 12, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>
                    per unit
                  </Text>
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
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: '#D9C8BE',
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: '#F6EEDF',
                      borderRightWidth: 1,
                      borderRightColor: '#E4D8C3',
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#B5502F' }}>
                      ₹
                    </Text>
                  </View>
                  <TextInput
                    value={labourCost}
                    onChangeText={setLabourCost}
                    keyboardType="number-pad"
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 16,
                      color: '#2B2420',
                    }}
                    placeholder="550"
                  />
                  <Text style={{ paddingHorizontal: 12, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>
                    per unit
                  </Text>
                </View>
              </View>

              {/* Total Base Cost */}
              <View
                style={{
                  backgroundColor: '#F8F6F2',
                  borderRadius: 8,
                  padding: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#E8E2DA',
                }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#56423C' }}>
                  Your Total Production Cost:
                </Text>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#2B2420' }}>
                  ₹{totalBaseCost}
                </Text>
              </View>

              {/* ACTION BUTTON: Get AI Pricing Suggestion */}
              <TouchableOpacity
                onPress={handleGetAIPricing}
                disabled={loading}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#B5502F',
                  borderRadius: 10,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                  shadowColor: '#B5502F',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' }}>
                      Searching Real Market Prices...
                    </Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} color="#FFFFFF" />
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' }}>
                      {hasSearched ? 'Refresh AI Pricing Suggestion ✨' : 'Get AI Pricing Suggestion ✨'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {searchError && (
                <View
                  style={{
                    backgroundColor: 'rgba(181,80,47,0.08)',
                    borderRadius: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(181,80,47,0.2)',
                  }}
                >
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#B5502F' }}>
                    {searchError}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 3: REAL MARKET ANALYSIS & AI SUGGESTION RESULTS
             ───────────────────────────────────────────────────────────── */}
          {loading && (
            <Card>
              <View style={{ padding: 16, alignItems: 'center', gap: 12 }}>
                <ActivityIndicator color="#B5502F" size="large" />
                <Text
                  style={{
                    fontFamily: 'Fraunces_600SemiBold',
                    fontSize: 16,
                    color: '#2B2420',
                    textAlign: 'center',
                  }}
                >
                  Scanning Live Market Listings...
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    color: '#66534C',
                    textAlign: 'center',
                    lineHeight: 18,
                  }}
                >
                  Using Tavily to search Amazon, Flipkart, Meesho & Etsy for "{productName}" to identify genuine current market prices.
                </Text>
              </View>
            </Card>
          )}

          {!loading && aiPricing && (
            <Card>
              <View style={{ gap: 16 }}>
                {/* Header with Live Status */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Globe size={18} color="#5B6E4E" />
                    <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 17, color: '#2B2420' }}>
                      Live Market Analysis
                    </Text>
                  </View>
                  <AIBadge
                    label={aiPricing.pricingSource === 'live_search' ? 'Real Web Data' : 'Benchmark Data'}
                    variant={aiPricing.pricingSource === 'live_search' ? 'insight' : 'suggested'}
                  />
                </View>

                {/* 3-Tier Comparison Grid */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: '#FDFBF7',
                    borderRadius: 10,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#E8DED8',
                  }}
                >
                  {/* Real Minimum Cost */}
                  <View style={{ gap: 4, alignItems: 'center', flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 11,
                        color: '#8A726B',
                        textTransform: 'uppercase',
                      }}
                    >
                      Market Min
                    </Text>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#2B2420' }}>
                      ₹{aiPricing.min ?? 0}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: '#8A726B', textAlign: 'center' }}>
                      Lowest online
                    </Text>
                  </View>

                  {/* Suggested Fair Retail */}
                  <View
                    style={{
                      gap: 4,
                      alignItems: 'center',
                      flex: 1.3,
                      backgroundColor: '#FFFFFF',
                      paddingHorizontal: 8,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: '#B5502F',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_700Bold',
                        fontSize: 11,
                        color: '#B5502F',
                        textTransform: 'uppercase',
                      }}
                    >
                      AI Suggested
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
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 11,
                        color: '#8A726B',
                        textTransform: 'uppercase',
                      }}
                    >
                      Market Max
                    </Text>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#2B2420' }}>
                      ₹{aiPricing.max ?? 0}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: '#8A726B', textAlign: 'center' }}>
                      Highest online
                    </Text>
                  </View>
                </View>

                {/* Option to adopt the AI Suggested Price */}
                {aiPricing.suggested && (
                  <TouchableOpacity
                    onPress={handleApplySuggestedPrice}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: '#F7EFE8',
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      borderWidth: 1,
                      borderColor: '#E8D2C5',
                    }}
                  >
                    <CheckCircle2 size={16} color="#B5502F" />
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#B5502F' }}>
                      Use AI Suggested Price (₹{aiPricing.suggested})
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Reasoning Description */}
                {Boolean(aiPricing.reasoning) && (
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C', lineHeight: 20 }}>
                    {aiPricing.reasoning}
                  </Text>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    SECTION 4: VERIFIED SOURCE LINKS (CLICKABLE WITH REDIRECT)
                   ───────────────────────────────────────────────────────────── */}
                {Array.isArray(aiPricing.sources) && aiPricing.sources.length > 0 && (
                  <View style={{ gap: 10, paddingTop: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ gap: 2 }}>
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#2B2420' }}>
                          Verified Market Sources
                        </Text>
                        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B' }}>
                          Tap any listing to inspect the live product page
                        </Text>
                      </View>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#5B6E4E' }}>
                        {aiPricing.sources.length} Found
                      </Text>
                    </View>

                    <View style={{ gap: 8 }}>
                      {aiPricing.sources.slice(0, 5).map((src: PriceListingSource, idx: number) => {
                        if (!src) return null;
                        const hasUrl = Boolean(src.url && src.url.trim().length > 0);

                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => hasUrl && handleOpenSourceUrl(src.url)}
                            disabled={!hasUrl}
                            activeOpacity={0.7}
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: '#E8DED8',
                              padding: 10,
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 10,
                            }}
                          >
                            <View style={{ flex: 1, gap: 4 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View
                                  style={{
                                    backgroundColor: '#FDF2EE',
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                  }}
                                >
                                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#B5502F' }}>
                                    {src.marketplace || 'Online'}
                                  </Text>
                                </View>
                                <Text
                                  style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#2B2420' }}
                                  numberOfLines={1}
                                >
                                  {src.title || 'Product Listing'}
                                </Text>
                              </View>

                              {hasUrl && (
                                <Text
                                  style={{
                                    fontFamily: 'Inter_400Regular',
                                    fontSize: 10,
                                    color: '#8A726B',
                                  }}
                                  numberOfLines={1}
                                >
                                  {src.url.replace(/^https?:\/\//i, '').split('/')[0]}
                                </Text>
                              )}
                            </View>

                            <View style={{ alignItems: 'flex-end', gap: 2 }}>
                              {src.extractedPrice != null && (
                                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#2B2420' }}>
                                  ₹{src.extractedPrice}
                                </Text>
                              )}
                              {hasUrl && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#B5502F' }}>
                                    View Link
                                  </Text>
                                  <ExternalLink size={12} color="#B5502F" />
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Profit Margin Breakdown with Artisan's Current Price */}
                {numericPrice > 0 && (
                  <View
                    style={{
                      backgroundColor: '#F8F6F2',
                      borderRadius: 10,
                      padding: 14,
                      gap: 10,
                      borderWidth: 1,
                      borderColor: '#E8E2DA',
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#2B2420' }}>
                      Profit Margin (At Your Price ₹{numericPrice})
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#66534C' }}>
                        Your Material Cost
                      </Text>
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>
                        ₹{numericMaterial}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#66534C' }}>
                        Your Labour Cost
                      </Text>
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>
                        ₹{numericLabour}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingTop: 8,
                        borderTopWidth: 1,
                        borderTopColor: '#DDD6CC',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <ShieldCheck size={16} color="#5B6E4E" />
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#5B6E4E' }}>
                          Your Net Profit Margin
                        </Text>
                      </View>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#5B6E4E' }}>
                        +₹{Math.max(0, numericPrice - totalBaseCost)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Card>
          )}

          {/* Offline note */}
          {!isOnline && (
            <View
              style={{
                backgroundColor: 'rgba(181,80,47,0.06)',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#B5502F',
                padding: 12,
              }}
            >
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#B5502F' }}>
                You are offline. Your product will be saved locally and published when reconnected.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFDF8',
          borderTopWidth: 1,
          borderTopColor: '#E4D8C3',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <Button
          label={
            publishing
              ? 'Publishing Everywhere...'
              : isOnline
              ? 'Publish Product Everywhere 🚀'
              : 'Save Offline 💾'
          }
          onPress={handlePublish}
        />
      </View>
    </SafeAreaView>
  );
}
