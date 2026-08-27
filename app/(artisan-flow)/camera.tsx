import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Zap, RotateCcw, Circle, X } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [photos, setPhotos] = useState<string[]>([]);
  const cameraRef = useRef<any>(null);

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#FFF8F6' }} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#2B2420', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#FFFFFF', textAlign: 'center' }}>
          Camera Permission
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22 }}>
          ShilpSetu needs camera access to photograph your products.
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
    if (!cameraRef.current || photos.length >= 5) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    const newPhotos = [...photos, photo.uri];
    setPhotos(newPhotos);
    if (newPhotos.length >= 3) {
      // Auto-advance to processing after 3+ photos
      router.push({ pathname: '/(artisan-flow)/image-processing', params: { uris: JSON.stringify(newPhotos) } });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Camera preview */}
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
        {/* Top bar */}
        <SafeAreaView>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 9999, backgroundColor: 'rgba(0,0,0,0.6)' }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFF' }}>{photos.length}/5 photos</Text>
            </View>
            <TouchableOpacity
              onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
            >
              <RotateCcw size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Guide overlay */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 240, height: 240, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 12 }}>
            <View style={{ position: 'absolute', top: -1, left: -1, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#B5502F', borderRadius: 2 }} />
            <View style={{ position: 'absolute', top: -1, right: -1, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#B5502F', borderRadius: 2 }} />
            <View style={{ position: 'absolute', bottom: -1, left: -1, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#B5502F', borderRadius: 2 }} />
            <View style={{ position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#B5502F', borderRadius: 2 }} />
          </View>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 16, textAlign: 'center' }}>
            Place your craft within the frame
          </Text>
        </View>

        {/* Bottom controls */}
        <View style={{ paddingBottom: 48, alignItems: 'center', gap: 20 }}>
          {photos.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(artisan-flow)/image-processing', params: { uris: JSON.stringify(photos) } })}
              style={{ paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9999, backgroundColor: '#B5502F' }}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#FFFFFF' }}>
                Process {photos.length} {photos.length === 1 ? 'photo' : 'photos'} →
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={takePhoto}>
            <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' }} />
            </View>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}
