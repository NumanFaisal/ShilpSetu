import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FileDown, Sparkles, Check, Globe, ShieldCheck, Heart } from 'lucide-react-native';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AIBadge } from '../../components/ui/AIBadge';
import { downloadDraftCatalogPdf } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

export default function CatalogReviewScreen() {
  const { draftProduct, updateDraftProduct } = useAppStore();

  const [name, setName] = useState<string>(draftProduct.name || '');
  const [titleHi, setTitleHi] = useState<string>((draftProduct as any).titleHi || '');
  const [description, setDescription] = useState<string>(draftProduct.description || '');
  const [descriptionHi, setDescriptionHi] = useState<string>((draftProduct as any).descriptionHi || '');
  const [heritageStory, setHeritageStory] = useState<string>((draftProduct as any).heritageStory || '');
  const [craftProcess, setCraftProcess] = useState<string>((draftProduct as any).craftProcess || '');
  const [careInstructions, setCareInstructions] = useState<string>((draftProduct as any).careInstructions || '');
  const [dimensions, setDimensions] = useState<string>((draftProduct as any).dimensions || '');
  const [weight, setWeight] = useState<string>((draftProduct as any).weight || '');
  const [originRegion, setOriginRegion] = useState<string>((draftProduct as any).originRegion || '');
  const [langTab, setLangTab] = useState<'en' | 'hi'>('en');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const tags = draftProduct.tags || [];
  const highlights: string[] = (draftProduct as any).highlights || [
    '100% Handcrafted by traditional master artisans',
    'Made with sustainably sourced natural materials',
    'Fair-trade guaranteed with direct artisan compensation',
  ];

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const draftPayload = {
        ...draftProduct,
        name,
        titleEn: name,
        titleHi,
        description,
        descriptionEn: description,
        descriptionHi,
        heritageStory,
        craftProcess,
        careInstructions,
        dimensions,
        weight,
        originRegion,
        highlights,
        tags,
      };
      await downloadDraftCatalogPdf(draftPayload, name || 'artisan-catalog');
    } catch (err: any) {
      Alert.alert('PDF Download', err.message || 'Failed to download catalog PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleProceedToPricing = () => {
    updateDraftProduct({
      name,
      description,
      titleEn: name,
      titleHi,
      descriptionEn: description,
      descriptionHi,
      heritageStory,
      craftProcess,
      careInstructions,
      dimensions,
      weight,
      originRegion,
    } as any);
    router.push('/(artisan-flow)/pricing');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Review Detailed Catalog" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Header Badge & PDF Download CTA */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: '#2B2420' }}>Detailed Catalog</Text>
            <AIBadge label="Gemini AI" />
          </View>

          {/* Quick PDF Action */}
          <TouchableOpacity
            onPress={handleDownloadPdf}
            disabled={downloadingPdf}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#FFFDF8',
              borderWidth: 1.5,
              borderColor: '#B5502F',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9999,
            }}
          >
            {downloadingPdf ? (
              <ActivityIndicator size="small" color="#B5502F" />
            ) : (
              <FileDown size={15} color="#B5502F" strokeWidth={2} />
            )}
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#B5502F' }}>
              {downloadingPdf ? 'Generating...' : 'PDF Catalog'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photos Carousel */}
        {(draftProduct.images || []).length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {(draftProduct.images || []).map((uri, i) => (
                <View key={i} style={{ position: 'relative' }}>
                  <Image source={{ uri }} style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: '#F6EEDF', borderWidth: 1, borderColor: '#E4D8C3' }} />
                  {i === 0 && (
                    <View style={{ position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(43,36,32,0.85)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 9, color: '#FFFFFF' }}>Primary</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Language switcher for bilingual review */}
        <View style={{ flexDirection: 'row', backgroundColor: '#F6EEDF', borderRadius: 10, padding: 3, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setLangTab('en')}
            style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: 8,
              backgroundColor: langTab === 'en' ? '#FFFFFF' : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: langTab === 'en' ? '#B5502F' : '#8A726B' }}>English Catalog</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLangTab('hi')}
            style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: 8,
              backgroundColor: langTab === 'hi' ? '#FFFFFF' : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: langTab === 'hi' ? '#B5502F' : '#8A726B' }}>हिंदी कैटलॉग</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 16 }}>
          {/* Product Title */}
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>
                {langTab === 'en' ? 'Product Title (English)' : 'उत्पाद का नाम (हिंदी)'}
              </Text>
              <AIBadge label="Gemini SEO" />
            </View>
            {langTab === 'en' ? (
              <Input value={name} onChangeText={setName} placeholder="e.g. Handcrafted Terracotta Vase" />
            ) : (
              <Input value={titleHi} onChangeText={setTitleHi} placeholder="उदा. हस्तनिर्मित टेराकोटा फूलदान" />
            )}
          </View>

          {/* Product Description */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>
              {langTab === 'en' ? 'Product Story & Commercial Description' : 'उत्पाद का विवरण'}
            </Text>
            {langTab === 'en' ? (
              <Input
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={{ minHeight: 90, textAlignVertical: 'top' }}
              />
            ) : (
              <Input
                value={descriptionHi}
                onChangeText={setDescriptionHi}
                multiline
                numberOfLines={4}
                style={{ minHeight: 90, textAlignVertical: 'top' }}
              />
            )}
          </View>

          {/* Heritage & Cultural Story */}
          <View style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 14, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Globe size={16} color="#B5502F" />
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420' }}>Heritage & Tradition</Text>
            </View>
            <Input
              value={heritageStory}
              onChangeText={setHeritageStory}
              multiline
              numberOfLines={3}
              placeholder="Centuries-old craft heritage..."
              style={{ minHeight: 70, textAlignVertical: 'top', backgroundColor: '#FFFFFF' }}
            />
          </View>

          {/* Craft Technique & Process */}
          <View style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 14, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Heart size={16} color="#5B6E4E" />
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420' }}>Artisan Craft Process</Text>
            </View>
            <Input
              value={craftProcess}
              onChangeText={setCraftProcess}
              multiline
              numberOfLines={3}
              placeholder="Handcrafted process and technique..."
              style={{ minHeight: 70, textAlignVertical: 'top', backgroundColor: '#FFFFFF' }}
            />
          </View>

          {/* Technical Specifications Grid */}
          <View style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 14, gap: 10 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420' }}>Technical Specifications</Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B' }}>Dimensions</Text>
                <Input value={dimensions} onChangeText={setDimensions} placeholder="e.g. 12 × 8 inches" />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B' }}>Weight</Text>
                <Input value={weight} onChangeText={setWeight} placeholder="e.g. 650 grams" />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B' }}>Craft Type</Text>
                <View style={{ backgroundColor: '#F6EEDF', padding: 10, borderRadius: 8 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#2B2420' }}>{draftProduct.craftType || 'Traditional Craft'}</Text>
                </View>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B' }}>Material</Text>
                <View style={{ backgroundColor: '#F6EEDF', padding: 10, borderRadius: 8 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#2B2420' }}>{draftProduct.material || 'Natural Material'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Key Highlights */}
          {highlights.length > 0 && (
            <View style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 14, gap: 8 }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420' }}>Product Highlights</Text>
              {highlights.map((highlight, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(91,110,78,0.15)', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                    <Check size={11} color="#5B6E4E" strokeWidth={3} />
                  </View>
                  <Text style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12.5, color: '#56423C', lineHeight: 18 }}>{highlight}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Care & Maintenance */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>Care & Maintenance Instructions</Text>
            <Input
              value={careInstructions}
              onChangeText={setCareInstructions}
              placeholder="e.g. Wipe gently with dry cloth. Avoid harsh chemicals."
            />
          </View>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>SEO Keywords & Category Tags</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {tags.map((tag) => (
                  <View key={tag} style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 9999, backgroundColor: '#F6EEDF', borderWidth: 1, borderColor: '#E4D8C3' }}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#56423C' }}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA Bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={handleDownloadPdf}
          disabled={downloadingPdf}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: '#B5502F',
            backgroundColor: '#FFF8F6',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {downloadingPdf ? (
            <ActivityIndicator size="small" color="#B5502F" />
          ) : (
            <FileDown size={18} color="#B5502F" strokeWidth={2} />
          )}
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#B5502F' }}>
            {downloadingPdf ? 'Generating...' : 'Download PDF'}
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1.6 }}>
          <Button label="Set Price & Publish →" onPress={handleProceedToPricing} />
        </View>
      </View>
    </SafeAreaView>
  );
}
