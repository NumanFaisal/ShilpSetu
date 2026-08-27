import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Mic, MicOff, ChevronRight, Edit3 } from 'lucide-react-native';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { AIProcessingScreen } from '../../components/ui/WeavingThreadLoader';
import { processVoice } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

export default function VoiceDescriptionScreen() {
  const { simulateAIError, updateDraftProduct } = useAppStore();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startRecording = () => {
    setRecording(true);
    // Pulsing animation
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopRecording = async () => {
    setRecording(false);
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
    setProcessing(true);

    try {
      const result = await processVoice('mock-audio.mp4', { simulateError: simulateAIError });
      setTranscription(result.transcription);
      setAttributes(result.extractedAttributes as Record<string, string>);
      updateDraftProduct({
        name: result.extractedAttributes.productName || '',
        material: result.extractedAttributes.material || '',
        description: result.transcription,
        category: result.extractedAttributes.craftType || '',
      });
      setDone(true);
    } catch (e) {
      router.push('/(artisan-flow)/manual-description');
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <AIProcessingScreen
        title="Understanding your description"
        subtitle="AI is transcribing and extracting product attributes"
        steps={['Transcribing audio', 'Detecting language', 'Extracting product attributes', 'Filling catalog form']}
        currentStep={2}
      />
    );
  }

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
        <Header title="AI Understood" showBack />
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20, gap: 20 }}>
          {/* Transcription */}
          <View style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 16, gap: 8 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.6 }}>What I heard</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#2B2420', lineHeight: 22, fontStyle: 'italic' }}>
              "{transcription}"
            </Text>
          </View>

          {/* Extracted attributes */}
          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Extracted Details</Text>
            {Object.entries(attributes).map(([key, value]) => (
              value ? (
                <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0E8DC' }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420', flex: 1, textAlign: 'right' }}>{value}</Text>
                </View>
              ) : null
            ))}
          </View>

          <Button label="Generate Catalog →" onPress={() => router.push('/(artisan-flow)/catalog-generation')} />
          <Button label="Edit Manually" onPress={() => router.push('/(artisan-flow)/manual-description')} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Describe Product" showBack />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 32 }}>
        <View style={{ gap: 8, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#2B2420', textAlign: 'center', lineHeight: 36 }}>
            Describe your{'\n'}product in your{'\n'}own language
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#56423C', textAlign: 'center', lineHeight: 22 }}>
            Speak in Hindi, Marathi, Telugu, or any Indian language. AI will understand.
          </Text>
        </View>

        {/* Mic button */}
        <View style={{ alignItems: 'center', gap: 16 }}>
          {recording && (
            <Animated.View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 2,
                borderColor: '#B5502F',
                position: 'absolute',
                transform: [{ scale: pulseAnim }],
                opacity: 0.3,
              }}
            />
          )}
          <TouchableOpacity
            onPress={recording ? stopRecording : startRecording}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: recording ? '#B5502F' : '#FFFDF8',
              borderWidth: 2,
              borderColor: '#B5502F',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {recording ? (
              <MicOff size={32} color="#FFFFFF" strokeWidth={1.5} />
            ) : (
              <Mic size={32} color="#B5502F" strokeWidth={1.5} />
            )}
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>
            {recording ? 'Tap to stop' : 'Tap to start speaking'}
          </Text>
          {recording && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#B5502F' }} />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#B5502F' }}>Recording...</Text>
            </View>
          )}
        </View>

        {/* Alternative: type */}
        <TouchableOpacity
          onPress={() => router.push('/(artisan-flow)/manual-description')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Edit3 size={16} color="#8A726B" strokeWidth={1.5} />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B', textDecorationLine: 'underline' }}>
            Type manually instead
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
