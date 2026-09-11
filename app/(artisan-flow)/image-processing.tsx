import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Check, Sparkles, ImagePlus, RefreshCw, Eye, Layers } from 'lucide-react-native';
import { AIProcessingScreen } from '../../components/ui/WeavingThreadLoader';
import { Button } from '../../components/ui/Button';
import { AIBadge } from '../../components/ui/AIBadge';
import { processImages, imageStudioApi, StudioStyle } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

const PROCESSING_STEPS = [
  'Analysing craft composition & angles',
  'Removing background with AI precision',
  'Rendering realistic studio lighting & reflections',
  'Sharpening handmade textures & intricate details',
  'Generating high-resolution marketplace formats',
];

const DEFAULT_STYLES: StudioStyle[] = [
  {
    id: 'white_studio',
    name: 'White Studio',
    description: 'Clean white cyclorama with soft diffused lighting. Perfect for Amazon & Flipkart.',
    previewColor: '#F5F6F8',
  },
  {
    id: 'wooden_surface',
    name: 'Wooden Surface',
    description: 'Warm teak wood tabletop with natural grain. Ideal for handmade pottery & crafts.',
    previewColor: '#A67B4B',
  },
  {
    id: 'marble_surface',
    name: 'Marble Surface',
    description: 'Luxurious Carrara marble with subtle veining. Great for jewelry & premium decor.',
    previewColor: '#E5E3DF',
  },
  {
    id: 'luxury',
    name: 'Luxury Dark',
    description: 'Dark editorial backdrop with golden rim lighting. High-end luxury photography.',
    previewColor: '#1E222A',
  },
];

/** Ensures any image value (string, object with uri, object with url) becomes a pure primitive string */
export function resolveImageUri(input: any): string {
  if (!input) return '';
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('{') && trimmed.includes('"uri"')) {
      try {
        const parsed = JSON.parse(trimmed);
        return resolveImageUri(parsed);
      } catch {}
    }
    return trimmed;
  }
  if (typeof input === 'object') {
    if (typeof input.uri === 'string') return input.uri;
    if (typeof input.url === 'string') return input.url;
    if (typeof input.square === 'string') return input.square;
    if (typeof input.path === 'string') return input.path;
    if (typeof input.originalKey === 'string') return input.originalKey;
    if (input.uri && typeof input.uri === 'object') return resolveImageUri(input.uri);
  }
  return '';
}

export default function ImageProcessingScreen() {
  const { uris, batchId: paramBatchId } = useLocalSearchParams<{ uris?: string; batchId?: string }>();
  const { simulateAIError, updateDraftProduct, draftProduct } = useAppStore();

  const [images, setImages] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'enhanced' | 'original'>('enhanced');
  const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait' | 'landscape'>('square');
  const [availableOutputs, setAvailableOutputs] = useState<{
    square?: string;
    portrait?: string;
    landscape?: string;
  }>({});
  const [availableOutputsMap, setAvailableOutputsMap] = useState<
    Record<number, { square?: string; portrait?: string; landscape?: string }>
  >({});

  const [styles, setStyles] = useState<StudioStyle[]>(DEFAULT_STYLES);
  const [selectedStyle, setSelectedStyle] = useState<string>('white_studio');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(paramBatchId || null);
  const [batchStatus, setBatchStatus] = useState<string>('IDLE');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [enhancements, setEnhancements] = useState<string[]>([
    'AI precision background removed',
    'Studio cyclorama backdrop rendered',
    'Commercial lighting & contact shadow',
    'High-resolution multi-format exports',
  ]);

  const pollTimerRef = useRef<any>(null);

  // Helper: Fetch enhanced images directly from http://localhost:5001/api/image-batches/:batchId
  const fetchBatchEnhanced = async (targetBatchId: string): Promise<boolean> => {
    if (!targetBatchId || targetBatchId.startsWith('batch_')) {
      return false;
    }
    try {
      setIsRefreshing(true);
      console.log(`[ImageProcessing] Fetching batch status: /api/image-batches/${targetBatchId}`);
      const details = await imageStudioApi.getBatchStatus(targetBatchId);

      if (details) {
        setBatchStatus(details.status || 'PROCESSING');

        if (details.images && details.images.length > 0) {
          const map: Record<number, { square?: string; portrait?: string; landscape?: string }> = {};
          details.images.forEach((img: any, idx: number) => {
            if (img?.outputs) {
              map[idx] = {
                square: resolveImageUri(img.outputs.square),
                portrait: resolveImageUri(img.outputs.portrait),
                landscape: resolveImageUri(img.outputs.landscape),
              };
            }
          });
          setAvailableOutputsMap(map);

          const firstImg = details.images[0];
          if (firstImg?.outputs) {
            setAvailableOutputs({
              square: resolveImageUri(firstImg.outputs.square),
              portrait: resolveImageUri(firstImg.outputs.portrait),
              landscape: resolveImageUri(firstImg.outputs.landscape),
            });
          }

          const urls = details.images
            .map((img: any) => resolveImageUri(img.outputs?.square || img.outputs?.portrait || img.outputs?.landscape))
            .filter((u: string) => Boolean(u) && u.length > 0);

          if (urls.length > 0) {
            console.log(`[ImageProcessing] Received ${urls.length}/${details.images.length} enhanced studio URLs from batch API`);
            setProcessedImages(urls);
            setImages(urls);
            updateDraftProduct({ images: urls });
            setViewMode('enhanced');
            setDone(true);

            // Only stop polling when ALL expected images are finished
            const totalTarget = details.totalImages || details.images.length;
            const isAllComplete =
              urls.length >= totalTarget ||
              details.status === 'COMPLETED' ||
              details.status === 'PARTIAL_FAILURE';

            if (isAllComplete) {
              return true;
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('[ImageProcessing] getBatchStatus error:', err.message);
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      }
    } finally {
      setIsRefreshing(false);
    }
    return false;
  };

  // Load passed URIs from camera or storage, prioritizing draftProduct.images if more complete
  useEffect(() => {
    let parsedUris: string[] = [];
    if (uris) {
      try {
        const parsed = JSON.parse(uris);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedUris = parsed.map(resolveImageUri).filter((u) => Boolean(u) && typeof u === 'string');
        } else if (parsed) {
          const single = resolveImageUri(parsed);
          if (single) parsedUris = [single];
        }
      } catch {
        if (typeof uris === 'string') {
          const clean = resolveImageUri(uris);
          if (clean) parsedUris = [clean];
        }
      }
    }

    if (draftProduct?.images && draftProduct.images.length > parsedUris.length) {
      const storeUris = draftProduct.images.map(resolveImageUri).filter(Boolean);
      if (storeUris.length > 0) {
        parsedUris = storeUris;
      }
    }

    if (parsedUris.length > 0) {
      setImages(parsedUris);
      setOriginalImages(parsedUris);
    }
  }, [uris, draftProduct?.images]);

  // If batchId is passed in URL, automatically load from http://localhost:5001/api/image-batches/:batchId
  useEffect(() => {
    if (paramBatchId) {
      setBatchId(paramBatchId);
      fetchBatchEnhanced(paramBatchId);
    }
  }, [paramBatchId]);

  // Fetch backend studio styles
  useEffect(() => {
    let mounted = true;
    imageStudioApi
      .getStyles()
      .then((fetched) => {
        if (mounted && fetched && fetched.length > 0) {
          setStyles(fetched);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Background Poller: If batchId exists and all enhanced images are not yet ready, poll every 2s
  useEffect(() => {
    if (!batchId || !done || batchId.startsWith('batch_')) return;

    const expectedCount = Math.max(originalImages.length, 1);
    const hasAllRemoteUrls =
      processedImages.length >= expectedCount &&
      processedImages.every((u) => typeof u === 'string' && u.startsWith('http')) &&
      (batchStatus === 'COMPLETED' || batchStatus === 'PARTIAL_FAILURE');

    if (hasAllRemoteUrls) return;

    console.log(`[ImageProcessing] Starting background polling for batch ${batchId} (${processedImages.length}/${expectedCount} images ready)...`);
    let attempts = 0;
    const maxAttempts = 35;

    pollTimerRef.current = setInterval(async () => {
      attempts++;
      const success = await fetchBatchEnhanced(batchId);
      if (success || attempts >= maxAttempts) {
        clearInterval(pollTimerRef.current);
      }
    }, 1200);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [batchId, done, processedImages.length, originalImages.length, batchStatus]);

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.65,
        base64: true,
      });
      if (!result.canceled && result.assets) {
        const selected = result.assets
          .map((a) => {
            if (a.base64) {
              return `data:image/jpeg;base64,${a.base64}`;
            }
            return resolveImageUri(a?.uri || a);
          })
          .filter((u) => Boolean(u) && typeof u === 'string');
        if (selected.length > 0) {
          setImages(selected);
          setOriginalImages(selected);
          setDone(false);
        }
      }
    } catch (err: any) {
      console.warn('[ImageProcessing] Gallery picker error:', err?.message || err);
    }
  };

  const startProcessing = async (imageUris: string[], styleId: string = selectedStyle) => {
    const cleanInputs = imageUris.map(resolveImageUri).filter(Boolean);
    if (cleanInputs.length === 0) return;
    setProcessing(true);
    setError(null);

    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= PROCESSING_STEPS.length - 1) clearInterval(stepInterval);
    }, 800);

    try {
      const result = await processImages(cleanInputs, {
        style: styleId,
        simulateError: simulateAIError,
      });

      clearInterval(stepInterval);
      setCurrentStep(PROCESSING_STEPS.length - 1);

      if (result.id) {
        setBatchId(result.id);
      }
      if (result.enhancements && result.enhancements.length > 0) {
        setEnhancements(result.enhancements);
      }

      // If remote enhanced images were returned, clean and use them
      const cleanProcessed = (result.processedImages || [])
        .map(resolveImageUri)
        .filter(Boolean);

      if (cleanProcessed.length > 0 && cleanProcessed.some((u) => u.startsWith('http'))) {
        setProcessedImages(cleanProcessed);
        setImages(cleanProcessed);
        updateDraftProduct({ images: cleanProcessed });
      } else if (result.id) {
        // Otherwise attempt immediate fetch from batch API
        await fetchBatchEnhanced(result.id);
      }

      setViewMode('enhanced');
      setDone(true);
    } catch (e: any) {
      clearInterval(stepInterval);
      setError(e.message || 'Image enhancement failed. Please verify network connection.');
    } finally {
      setProcessing(false);
    }
  };

  // 1. Empty State
  if (images.length === 0 && !batchId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 20 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: 'rgba(181,80,47,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImagePlus size={36} color="#B5502F" />
          </View>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#2B2420', textAlign: 'center' }}>
            Select Product Photos
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 15,
              color: '#56423C',
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Choose up to 5 photos of your craft. Our AI Studio will remove backgrounds and apply professional studio lighting.
          </Text>
          <Button label="Choose from Gallery" onPress={pickFromGallery} />
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 8 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Processing State
  if (processing) {
    return (
      <AIProcessingScreen
        title="AI Studio Rendering Backdrop"
        subtitle={`Applying ${styles.find((s) => s.id === selectedStyle)?.name || 'Studio'} lighting and generating 4K exports`}
        steps={PROCESSING_STEPS}
        currentStep={currentStep}
      />
    );
  }

  // 3. Error State
  if (error) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#FFF8F6',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          gap: 20,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'rgba(156,74,60,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 28 }}>⚠️</Text>
        </View>
        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#2B2420', textAlign: 'center' }}>
          Enhancement Failed
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: '#56423C',
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          {error}
        </Text>
        <Button label="Try Again" onPress={() => startProcessing(originalImages.length > 0 ? originalImages : images)} />
        <Button
          label="Continue Without AI"
          onPress={() => {
            updateDraftProduct({ images });
            router.push('/(artisan-flow)/voice-description');
          }}
          variant="ghost"
        />
      </SafeAreaView>
    );
  }

  // 4. Done State: Show enhanced studio photo
  if (done) {
    const selectedStyleObj = styles.find((s) => s.id === selectedStyle);
    const isEnhancedMode = viewMode === 'enhanced';
    const hasRemoteEnhanced =
      processedImages.length > 0 &&
      processedImages.some((u) => typeof u === 'string' && u.startsWith('http'));

    // Select URI based on aspect ratio for the specifically selected active photo
    const activePhotoOutputs = availableOutputsMap[activePhotoIdx] || availableOutputs;
    let currentEnhancedUri = resolveImageUri(processedImages[activePhotoIdx] || processedImages[0]);
    if (activePhotoOutputs && activePhotoOutputs[aspectRatio]) {
      currentEnhancedUri = resolveImageUri(activePhotoOutputs[aspectRatio]);
    }

    const rawActiveUri = isEnhancedMode && hasRemoteEnhanced
      ? currentEnhancedUri
      : originalImages[activePhotoIdx] || originalImages[0] || images[activePhotoIdx] || images[0];
    const currentUri = resolveImageUri(rawActiveUri);

    const activeList = (isEnhancedMode && hasRemoteEnhanced ? processedImages : originalImages.length > 0 ? originalImages : images)
      .map(resolveImageUri)
      .filter(Boolean);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#2B2420' }}>
                  Studio Photos Ready
                </Text>
                <AIBadge
                  label={hasRemoteEnhanced ? 'AI Studio Active' : 'Rendering...'}
                  variant={hasRemoteEnhanced ? 'match' : 'suggested'}
                />
              </View>
              {batchId && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>
                    Batch #{batchId.slice(0, 8)} • {selectedStyleObj?.name || 'Studio'} • {batchStatus}
                  </Text>
                  <TouchableOpacity
                    onPress={() => batchId && fetchBatchEnhanced(batchId)}
                    style={{ padding: 4 }}
                    disabled={isRefreshing}
                  >
                    <RefreshCw size={12} color={isRefreshing ? '#B5502F' : '#8A726B'} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* View Mode Toggle: Enhanced vs Original */}
          <View style={{ flexDirection: 'row', backgroundColor: '#F0E7DF', borderRadius: 10, padding: 3 }}>
            <TouchableOpacity
              onPress={() => setViewMode('enhanced')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: viewMode === 'enhanced' ? '#FFFFFF' : 'transparent',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={14} color={viewMode === 'enhanced' ? '#B5502F' : '#8A726B'} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  color: viewMode === 'enhanced' ? '#B5502F' : '#8A726B',
                }}
              >
                Studio Enhanced
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('original')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: viewMode === 'original' ? '#FFFFFF' : 'transparent',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Eye size={14} color={viewMode === 'original' ? '#2B2420' : '#8A726B'} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 13,
                  color: viewMode === 'original' ? '#2B2420' : '#8A726B',
                }}
              >
                Original Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Aspect Ratio Selector (if outputs available) */}
          {isEnhancedMode && hasRemoteEnhanced && (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Layers size={14} color="#8A726B" />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8A726B' }}>Aspect Ratio:</Text>
              {(['square', 'portrait', 'landscape'] as const).map((ratio) => (
                <TouchableOpacity
                  key={ratio}
                  onPress={() => setAspectRatio(ratio)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: aspectRatio === ratio ? '#B5502F' : '#EFE7E2',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 11,
                      color: aspectRatio === ratio ? '#FFFFFF' : '#56423C',
                      textTransform: 'capitalize',
                    }}
                  >
                    {ratio === 'square' ? '1:1 Square' : ratio === 'portrait' ? '4:5 Portrait' : '16:9 Banner'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Featured Active Image View */}
          <View
            style={{
              width: '100%',
              height: 300,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: viewMode === 'enhanced' ? '#B5502F' : '#E8DED8',
              backgroundColor: '#FFFFFF',
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {Boolean(currentUri) ? (
              <>
                <Image source={{ uri: currentUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                {isEnhancedMode && !hasRemoteEnhanced && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      backgroundColor: 'rgba(43,36,32,0.85)',
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <ActivityIndicator size="small" color="#E59866" />
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF' }}>
                      Studio Lighting Rendering...
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                    {viewMode === 'enhanced' ? `✨ ${selectedStyleObj?.name || 'Studio'}` : 'Original Photo'}
                  </Text>
                </View>
                {isEnhancedMode && hasRemoteEnhanced && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      backgroundColor: 'rgba(91,110,78,0.85)',
                      borderRadius: 14,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'Inter_500Medium' }}>
                      API: /api/image-batches/{batchId?.slice(0, 8)}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color="#B5502F" />
              </View>
            )}
          </View>

          {/* Thumbnails row */}
          {activeList.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {activeList.map((item, idx) => {
                const thumbUri = resolveImageUri(item);
                if (!thumbUri) return null;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setActivePhotoIdx(idx)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 10,
                      overflow: 'hidden',
                      borderWidth: activePhotoIdx === idx ? 2 : 1,
                      borderColor: activePhotoIdx === idx ? '#B5502F' : '#E8DED8',
                    }}
                  >
                    <Image source={{ uri: thumbUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Enhancements List */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              gap: 10,
              borderWidth: 1,
              borderColor: '#E8DED8',
            }}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2B2420' }}>
              Studio Specifications Applied
            </Text>
            {enhancements.map((e, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#5B6E4E',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#2B2420' }}>{e}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 10, marginTop: 4 }}>
            <Button
              label="Continue to Describe Craft →"
              onPress={() => {
                if (processedImages.length > 0) {
                  updateDraftProduct({ images: processedImages });
                }
                router.push('/(artisan-flow)/voice-description');
              }}
            />
            <TouchableOpacity
              onPress={() => setDone(false)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
              }}
            >
              <RefreshCw size={14} color="#B5502F" />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#B5502F' }}>
                Change Studio Backdrop & Re-enhance
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 5. Pre-Processing State
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#2B2420' }}>
              AI Studio Setup
            </Text>
            <Sparkles size={20} color="#B5502F" />
          </View>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', lineHeight: 20 }}>
            Select a studio backdrop style for your {images.length} {images.length === 1 ? 'photo' : 'photos'}.
          </Text>
        </View>

        {/* Selected Photos Strip */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2B2420' }}>
              Selected Photos ({images.length}/5)
            </Text>
            <TouchableOpacity onPress={pickFromGallery}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#B5502F' }}>+ Add / Change</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {images.map((item, idx) => {
              const photoUri = resolveImageUri(item);
              if (!photoUri) return null;
              return (
                <View
                  key={idx}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 10,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#E8DED8',
                    backgroundColor: '#F6EEDF',
                  }}
                >
                  <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Studio Styles Picker */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#2B2420' }}>
            Choose Studio Backdrop
          </Text>

          <View style={{ gap: 12 }}>
            {styles.map((style) => {
              const isSelected = selectedStyle === style.id;
              const previewUrl = resolveImageUri((style as any).preview || imageStudioApi.getStylePreviewUrl(style.id));

              return (
                <TouchableOpacity
                  key={style.id}
                  onPress={() => {
                    console.log('[ImageProcessing] Selected backdrop style:', style.id);
                    setSelectedStyle(style.id);
                  }}
                  activeOpacity={0.65}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isSelected ? '#FFF5F0' : '#FFFFFF',
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 2,
                    borderColor: isSelected ? '#B5502F' : '#E8DED8',
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: style.previewColor || '#F5F6F8',
                      borderWidth: 1,
                      borderColor: '#DDD',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {Boolean(previewUrl) && (
                      <Image source={{ uri: previewUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                    )}
                  </View>

                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#2B2420' }}>
                      {style.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: '#66534C',
                        lineHeight: 16,
                      }}
                      numberOfLines={2}
                    >
                      {style.description || 'Professional studio cyclorama backdrop.'}
                    </Text>
                  </View>

                  {/* Explicit Radio Circle Indicator */}
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      borderWidth: 2,
                      borderColor: isSelected ? '#B5502F' : '#C4B5AE',
                      backgroundColor: isSelected ? '#B5502F' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && <Check size={15} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Submit Button */}
        <View style={{ gap: 12, marginTop: 8 }}>
          <Button
            label={`Enhance with ${styles.find((s) => s.id === selectedStyle)?.name || 'AI'}`}
            onPress={() => startProcessing(images, selectedStyle)}
          />
          <TouchableOpacity
            onPress={() => {
              updateDraftProduct({ images });
              router.push('/(artisan-flow)/voice-description');
            }}
            style={{ alignItems: 'center', paddingVertical: 8 }}
          >
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>
              Skip Enhancement & Continue →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
