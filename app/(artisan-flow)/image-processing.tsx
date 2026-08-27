import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Image, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Check } from 'lucide-react-native';
import { AIProcessingScreen } from '../../components/ui/WeavingThreadLoader';
import { Button } from '../../components/ui/Button';
import { AIBadge } from '../../components/ui/AIBadge';
import { processImages } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

const PROCESSING_STEPS = [
  'Analysing product composition',
  'Removing background',
  'Adjusting brightness & contrast',
  'Sharpening craft details',
  'Generating optimised images',
];

export default function ImageProcessingScreen() {
  const { uris } = useLocalSearchParams<{ uris?: string }>();
  const { simulateAIError, updateDraftProduct } = useAppStore();
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [enhancements, setEnhancements] = useState<string[]>([]);

  // Load passed URIs or let user pick from gallery
  useEffect(() => {
    if (uris) {
      const parsed = JSON.parse(uris);
      setImages(parsed);
      startProcessing(parsed);
    }
  }, [uris]);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });
    if (!result.canceled) {
      const selected = result.assets.map((a) => a.uri);
      setImages(selected);
      startProcessing(selected);
    }
  };

  const startProcessing = async (imageUris: string[]) => {
    setProcessing(true);
    setError(null);
    // Simulate step progression
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= PROCESSING_STEPS.length - 1) clearInterval(stepInterval);
    }, 500);

    try {
      const result = await processImages(imageUris, { simulateError: simulateAIError });
      clearInterval(stepInterval);
      setCurrentStep(PROCESSING_STEPS.length - 1);
      setEnhancements(result.enhancements);
      updateDraftProduct({ images: result.processedImages });
      setDone(true);
    } catch (e: any) {
      clearInterval(stepInterval);
      setError(e.message || 'Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  // Empty state: show gallery picker
  if (images.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 24 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#2B2420', textAlign: 'center' }}>
            Select Product Photos
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#56423C', textAlign: 'center', lineHeight: 22 }}>
            Choose up to 5 photos of your product from your device gallery.
          </Text>
          <Button label="Choose from Gallery" onPress={pickFromGallery} />
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Processing state
  if (processing) {
    return (
      <AIProcessingScreen
        title="Enhancing your photos"
        subtitle="AI is removing background and optimising image quality"
        steps={PROCESSING_STEPS}
        currentStep={currentStep}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(156,74,60,0.1)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 28 }}>⚠️</Text>
        </View>
        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#2B2420', textAlign: 'center' }}>Processing Failed</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', textAlign: 'center', lineHeight: 20 }}>{error}</Text>
        <Button label="Try Again" onPress={() => startProcessing(images)} />
        <Button label="Continue Without AI" onPress={() => { updateDraftProduct({ images }); router.push('/(artisan-flow)/voice-description'); }} variant="ghost" />
      </SafeAreaView>
    );
  }

  // Done state — show enhanced photos + enhancements applied
  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#2B2420' }}>Photos Enhanced</Text>
            <AIBadge label="AI Enhanced" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {images.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width: 120, height: 120, borderRadius: 10, backgroundColor: '#F6EEDF' }} />
            ))}
          </ScrollView>
          <View style={{ gap: 8 }}>
            {enhancements.map((e) => (
              <View key={e} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#5B6E4E', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={10} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#2B2420' }}>{e}</Text>
              </View>
            ))}
          </View>
          <Button label="Continue → Describe Product" onPress={() => router.push('/(artisan-flow)/voice-description')} />
        </View>
      </SafeAreaView>
    );
  }

  return <View style={{ flex: 1, backgroundColor: '#FFF8F6' }} />;
}
