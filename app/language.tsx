import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';
import { LANGUAGES } from '../mocks/seed';
import { Button } from '../components/ui/Button';

export default function LanguageScreen() {
  const { setSelectedLanguage } = useAppStore();
  const [selected, setSelected] = useState('en');


  // nothing

  const handleContinue = () => {
    setSelectedLanguage(selected);
    router.replace('/welcome');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 40, gap: 8 }}>
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 32,
              color: '#2B2420',
              lineHeight: 40,
            }}
          >
            Choose your{'\n'}language
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 15,
              color: '#56423C',
              lineHeight: 22,
            }}
          >
            अपनी भाषा चुनें · Select your preferred language
          </Text>
        </View>

        {/* Language list */}
        <View style={{ gap: 10, marginBottom: 40 }}>
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setSelected(lang.code)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: isSelected ? '#B5502F' : '#E4D8C3',
                  backgroundColor: isSelected ? 'rgba(181,80,47,0.04)' : '#FFFDF8',
                }}
              >
                <View style={{ gap: 2 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 17,
                      color: '#2B2420',
                    }}
                  >
                    {lang.label}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 13,
                      color: '#8A726B',
                    }}
                  >
                    {lang.english}
                  </Text>
                </View>
                {isSelected && (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#B5502F',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Button label="Continue" onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}
