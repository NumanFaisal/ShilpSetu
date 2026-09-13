import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AIProcessingScreen } from '../../components/ui/WeavingThreadLoader';
import { generateCatalog } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

const STEPS = [
  'Inspecting craft authenticity with Gemini AI',
  'Writing bilingual product titles & descriptions',
  'Tracing traditional craft heritage & regional roots',
  'Formulating technical specs & artisan labor hours',
  'Finalizing commercial e-commerce & PDF catalog',
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
        {
          images: draftProduct.images || [],
          voiceTranscription: draftProduct.description,
          attributes: { material: draftProduct.material, craftType: draftProduct.craftType },
        },
        { simulateError: simulateAIError }
      );
      clearInterval(interval);
      setCurrentStep(STEPS.length - 1);
      // Short pause to let the last step animate
      await new Promise((r) => setTimeout(r, 400));
      updateDraftProduct({
        name: catalog.name,
        description: catalog.aiDescription,
        category: catalog.category,
        tags: catalog.tags,
        titleEn: catalog.titleEn,
        titleHi: catalog.titleHi,
        descriptionEn: catalog.descriptionEn,
        descriptionHi: catalog.descriptionHi,
        heritageStory: (catalog as any).heritageStory,
        heritageStoryHi: (catalog as any).heritageStoryHi,
        craftProcess: (catalog as any).craftProcess,
        craftProcessHi: (catalog as any).craftProcessHi,
        dimensions: (catalog as any).dimensions,
        weight: (catalog as any).weight,
        primaryColors: (catalog as any).primaryColors,
        originRegion: (catalog as any).originRegion,
        highlights: (catalog as any).highlights,
        usageAndStyling: (catalog as any).usageAndStyling,
        careInstructions: (catalog as any).careInstructions,
        careInstructionsHi: (catalog as any).careInstructionsHi,
        sustainabilityNotes: (catalog as any).sustainabilityNotes,
        estimatedProductionHours: (catalog as any).estimatedProductionHours,
        keywords: (catalog as any).keywords,
      } as any);
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
