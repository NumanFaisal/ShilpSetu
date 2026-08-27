import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { setupArtisanProfile } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { CRAFT_CATEGORIES } from '../../mocks/seed';
import { CRAFT_ICON_MAP } from '../../components/icons/CraftIcons';
import { ARTISAN } from '../../mocks/seed';

type FormData = {
  name: string;
  location: string;
  experience: string;
};

const STEPS = ['Personal Info', 'Craft Type', 'Location'];

export default function ProfileSetupScreen() {
  const [step, setStep] = useState(0);
  const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { setArtisan } = useAppStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', location: '', experience: '8' },
  });

  const toggleCraft = (id: string) => {
    setSelectedCrafts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleSubmitForm = async (data: FormData) => {
    setLoading(true);
    try {
      const artisan = await setupArtisanProfile({
        name: data.name,
        crafts: selectedCrafts,
        location: data.location,
        experience: parseInt(data.experience),
      });
      setArtisan(ARTISAN as any);
      router.replace('/(artisan)/home');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Profile Setup" showBack={step > 0} onBack={() => setStep(step - 1)} />

      {/* Step indicator */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, gap: 8 }}>
        {STEPS.map((s, i) => (
          <View key={i} style={{ flex: 1, gap: 6 }}>
            <View
              style={{
                height: 3,
                borderRadius: 2,
                backgroundColor: i <= step ? '#B5502F' : '#E4D8C3',
              }}
            />
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: i <= step ? '#B5502F' : '#8A726B' }}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 0 — Personal Info */}
        {step === 0 && (
          <View style={{ gap: 24, marginTop: 16 }}>
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 26, color: '#2B2420', lineHeight: 34 }}>
                Tell us about{'\n'}yourself
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C' }}>
                This information helps buyers discover your craft.
              </Text>
            </View>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, value } }) => (
                <Input label="Full Name" placeholder="e.g. Sita Devi" value={value} onChangeText={onChange} error={errors.name?.message} />
              )}
            />
            <Controller
              control={control}
              name="experience"
              rules={{ required: 'Experience is required' }}
              render={({ field: { onChange, value } }) => (
                <Input label="Years of Experience" placeholder="e.g. 8" keyboardType="number-pad" value={value} onChangeText={onChange} error={errors.experience?.message} />
              )}
            />
            <Button label="Next →" onPress={handleNext} />
          </View>
        )}

        {/* Step 1 — Craft Type */}
        {step === 1 && (
          <View style={{ gap: 24, marginTop: 16 }}>
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 26, color: '#2B2420', lineHeight: 34 }}>
                What do you{'\n'}create?
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C' }}>
                Select all crafts that apply.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CRAFT_CATEGORIES.map((cat) => {
                const isSelected = selectedCrafts.includes(cat.id);
                const IconComp = CRAFT_ICON_MAP[cat.id] || CRAFT_ICON_MAP.default;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => toggleCraft(cat.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: isSelected ? '#B5502F' : '#E4D8C3',
                      backgroundColor: isSelected ? 'rgba(181,80,47,0.06)' : '#FFFDF8',
                    }}
                  >
                    <IconComp size={16} color={isSelected ? '#B5502F' : '#8A726B'} />
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: isSelected ? '#B5502F' : '#2B2420' }}>
                      {cat.label.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Button label="Next →" onPress={handleNext} disabled={selectedCrafts.length === 0} />
          </View>
        )}

        {/* Step 2 — Location */}
        {step === 2 && (
          <View style={{ gap: 24, marginTop: 16 }}>
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 26, color: '#2B2420', lineHeight: 34 }}>
                Where are you{'\n'}based?
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C' }}>
                Buyers look for artisans by region.
              </Text>
            </View>
            <Controller
              control={control}
              name="location"
              rules={{ required: 'Location is required' }}
              render={({ field: { onChange, value } }) => (
                <Input label="Village / Town / City, State" placeholder="e.g. Madhubani, Bihar" value={value} onChangeText={onChange} error={errors.location?.message} />
              )}
            />
            <Button label="Complete Profile" onPress={handleSubmit(handleSubmitForm)} loading={loading} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
