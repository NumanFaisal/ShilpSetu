import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { RotateCcw, X, Trash2, Image as ImageIcon, Zap, ZapOff } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';

export default function CameraScreen() {
  const updateDraftProduct = useAppStore((s) => s.updateDraftProduct);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000000' }} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#2B2420', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#FFFFFF', textAlign: 'center' }}>
          Camera Permission
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22 }}>
          ShilpSetu needs camera access to photograph your craft products.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{ backgroundColor: '#B5502F', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 28 }}
        >
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 16, color: '#FFFFFF' }}>Allow Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || photos.length >= 5 || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: true,
        skipProcessing: false,
      });

      // Prefer direct base64 data URI so native file system access errors are completely avoided
      const photoUri = photo?.base64
        ? `data:image/jpeg;base64,${photo.base64}`
        : photo?.uri || '';

      if (!photoUri) return;

      const newPhotos = [...photos, photoUri];
      setPhotos(newPhotos);

      // Advance automatically if max (5 photos) is reached
      if (newPhotos.length >= 5) {
        router.push({
          pathname: '/(artisan-flow)/image-processing',
          params: { uris: JSON.stringify(newPhotos) },
        });
      }
    } catch (err: any) {
      console.warn('[Camera] Failed to take picture:', err?.message || err);
    } finally {
      setIsCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5 - photos.length,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const picked = result.assets.map((asset) => {
          if (asset.base64) {
            return `data:image/jpeg;base64,${asset.base64}`;
          }
          return asset.uri;
        }).filter(Boolean);

        const merged = [...photos, ...picked].slice(0, 5);
        setPhotos(merged);
        updateDraftProduct({ images: merged });

        if (merged.length > 0) {
          router.push({
            pathname: '/(artisan-flow)/image-processing',
            params: { uris: JSON.stringify(merged) },
          });
        }
      }
    } catch (err: any) {
      console.warn('[Camera] Gallery pick error:', err?.message || err);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      updateDraftProduct({ images: updated });
      return updated;
    });
  };

  const proceedToProcessing = () => {
    if (photos.length === 0) return;
    updateDraftProduct({ images: photos });
    router.push({
      pathname: '/(artisan-flow)/image-processing',
      params: { uris: JSON.stringify(photos) },
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. CameraView occupies full screen */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="picture"
        enableTorch={flash === 'on'}
        onCameraReady={() => {
          console.log('[Camera] Camera ready');
          setIsCameraReady(true);
        }}
        onMountError={(e) => {
          console.warn('[Camera] Mount error:', e?.message || e);
        }}
      />

      {/* 2. Layer all overlays inside a transparent container that passes touches through */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top Header Controls */}
        <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{photos.length}/5 photos</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setFlash((prev) => (prev === 'on' ? 'off' : 'on'))}
                style={styles.iconButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                {flash === 'on' ? <Zap size={18} color="#EAA937" /> : <ZapOff size={18} color="#FFFFFF" />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
                style={styles.iconButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <RotateCcw size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Viewfinder Guide (strictly visual, never captures touches) */}
        <View style={styles.centerOverlay} pointerEvents="none">
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.guideText}>Place your craft within the frame</Text>
        </View>

        {/* Bottom Controls */}
        <SafeAreaView edges={['bottom']} style={styles.bottomOverlay} pointerEvents="box-none">
          {/* Thumbnails of captured photos */}
          {photos.length > 0 && (
            <View style={styles.thumbnailRow} pointerEvents="box-none">
              {photos.map((uri, idx) => (
                <View key={`photo-${idx}`} style={styles.thumbContainer}>
                  <Image source={{ uri }} style={styles.thumbImage} />
                  <TouchableOpacity
                    onPress={() => removePhoto(idx)}
                    style={styles.thumbDelete}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={10} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Process button when photos are ready */}
          {photos.length > 0 && (
            <TouchableOpacity onPress={proceedToProcessing} style={styles.processButton} activeOpacity={0.85}>
              <Text style={styles.processButtonText}>
                Process {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'} →
              </Text>
            </TouchableOpacity>
          )}

          {/* Shutter Bar with Gallery Option */}
          <View style={styles.shutterRow} pointerEvents="box-none">
            {/* Gallery Picker Shortcut */}
            <TouchableOpacity
              onPress={pickFromGallery}
              style={styles.galleryButton}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ImageIcon size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Main Shutter Button */}
            <TouchableOpacity
              onPress={takePhoto}
              disabled={isCapturing || photos.length >= 5}
              style={[styles.shutterOuter, (isCapturing || photos.length >= 5) && { opacity: 0.6 }]}
              activeOpacity={0.75}
            >
              {isCapturing ? (
                <ActivityIndicator color="#B5502F" size="small" />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </TouchableOpacity>

            {/* Spacer for symmetry */}
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topOverlay: {
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  counterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FFFFFF',
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#B5502F',
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },
  guideText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 18,
    textAlign: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 36,
    gap: 16,
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  thumbContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbDelete: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(181,80,47,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processButton: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 9999,
    backgroundColor: '#B5502F',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  processButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
});
