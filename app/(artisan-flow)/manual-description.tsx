import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { CRAFT_CATEGORIES } from '../../mocks/seed';

type FormData = {
  name: string;
  description: string;
  material: string;
  craftType: string;
  size: string;
  quantity: string;
};

export default function ManualDescriptionScreen() {
  const { draftProduct, updateDraftProduct } = useAppStore();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: draftProduct.name || '',
      description: draftProduct.description || '',
      material: draftProduct.material || '',
      craftType: draftProduct.category || '',
      size: '',
      quantity: '10',
    },
  });

  const onSubmit = (data: FormData) => {
    updateDraftProduct({
      name: data.name,
      description: data.description,
      material: data.material,
      category: data.craftType,
      quantity: parseInt(data.quantity),
    });
    router.push('/(artisan-flow)/catalog-generation');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Product Details" showBack />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#2B2420' }}>
          Tell us about your product
        </Text>

        <Controller control={control} name="name" rules={{ required: 'Product name is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Product Name *" placeholder="e.g. Handwoven Bamboo Basket" value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
        <Controller control={control} name="craftType" rules={{ required: 'Craft type is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Craft Type *" placeholder="e.g. Bamboo Craft, Handloom" value={value} onChangeText={onChange} error={errors.craftType?.message} />
          )}
        />
        <Controller control={control} name="material" rules={{ required: 'Material is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Material *" placeholder="e.g. Bamboo, Cotton, Clay" value={value} onChangeText={onChange} error={errors.material?.message} />
          )}
        />
        <Controller control={control} name="size"
          render={({ field: { onChange, value } }) => (
            <Input label="Dimensions / Size" placeholder="e.g. 12 × 10 inches" value={value} onChangeText={onChange} />
          )}
        />
        <Controller control={control} name="quantity"
          render={({ field: { onChange, value } }) => (
            <Input label="Available Quantity" keyboardType="number-pad" placeholder="10" value={value} onChangeText={onChange} hint="How many units can you currently supply?" />
          )}
        />
        <Controller control={control} name="description" rules={{ required: 'Description is required' }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description *"
              placeholder="Describe the craft technique, design, and special features..."
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={5}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
              error={errors.description?.message}
            />
          )}
        />
        <Button label="Generate AI Catalog →" onPress={handleSubmit(onSubmit)} />
      </ScrollView>
    </SafeAreaView>
  );
}
