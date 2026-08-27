import React, { useEffect, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { AIProcessingScreen } from '../../components/ui/WeavingThreadLoader';
import { generateCatalog } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

const STEPS = [
  'Analysing product category',
  'Generating product title',
  'Writing craft description',
  'Building SEO tags',
  'Creating catalog entry',
];

export default function CatalogGenerationScreen() {
  const { draftProduct, updateDraftProduct, simulateAIError } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generate();
  }, []);

  const generate = async () => {
    setError(null);
    setCurrentStep(0);
    // Animate steps
    const interval = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 600);

    try {
      const catalog = await generateCatalog(
        { images: draftProduct.images || [], manualDescription: draftProduct.description },
        { simulateError: simulateAIError }
      );
      clearInterval(interval);
      setCurrentStep(STEPS.length - 1);
      // Short pause to let the last step animate
      await new Promise((r) => setTimeout(r, 400));
      updateDraftProduct({ name: catalog.name, description: catalog.aiDescription });
      router.replace('/(artisan-flow)/catalog-review');
    } catch (e: any) {
      clearInterval(interval);
      setError(e.message || 'Catalog generation failed');
    }
  };

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 }}>
        <View>
          {/* Error state — simple retry */}
          <AIProcessingScreen title="Generation Failed" subtitle={error} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AIProcessingScreen
      title="Writing your catalog"
      subtitle="AI is crafting a beautiful product description and category tags"
      steps={STEPS}
      currentStep={currentStep}
    />
  );
}
