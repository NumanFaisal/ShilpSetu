import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Header } from '../components/ui/Header';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { postBulkRequest } from '../services/api';
import { CRAFT_CATEGORIES } from '../mocks/seed';

type BulkRequestFormData = {
  productType: string;
  quantity: string;
  budgetMin: string;
  budgetMax: string;
  deadline: string;
  requirements: string;
};

export default function BulkRequestScreen() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<BulkRequestFormData>({
    defaultValues: { productType: '', quantity: '500', budgetMin: '600', budgetMax: '1000', deadline: '2024-12-15', requirements: '' },
  });

  const onSubmit = async (data: BulkRequestFormData) => {
    setLoading(true);
    try {
      await postBulkRequest({
        category: data.productType,
        quantity: parseInt(data.quantity),
        budgetMin: parseInt(data.budgetMin),
        budgetMax: parseInt(data.budgetMax),
        deadline: data.deadline,
        requirements: data.requirements,
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ gap: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 64 }}>📋</Text>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#2B2420', textAlign: 'center' }}>Request Posted!</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#56423C', textAlign: 'center', lineHeight: 22 }}>
            AI is matching your request with verified artisans. You'll receive offers within 24 hours.
          </Text>
          <View style={{ width: '100%', gap: 10 }}>
            <Button label="View My Requests" onPress={() => router.replace('/(buyer)/requests')} />
            <Button label="Go to Home" onPress={() => router.replace('/(buyer)/home')} variant="secondary" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Post Bulk Request" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 12, gap: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#2B2420' }}>What are you looking for?</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', lineHeight: 20 }}>AI will match your request with the best artisans for your requirements.</Text>
        </View>

        <Controller control={control} name="productType" rules={{ required: 'Required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Product Type *" placeholder="e.g. Bamboo Baskets, Handloom Sarees" value={value} onChangeText={onChange} error={errors.productType?.message} />
          )}
        />
        <Controller control={control} name="quantity" rules={{ required: 'Required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Quantity Required (units) *" keyboardType="number-pad" placeholder="500" value={value} onChangeText={onChange} error={errors.quantity?.message} />
          )}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Controller control={control} name="budgetMin" rules={{ required: 'Required' }}
              render={({ field: { onChange, value } }) => (
                <Input label="Budget Min (₹)" keyboardType="number-pad" placeholder="600" value={value} onChangeText={onChange} error={errors.budgetMin?.message} />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller control={control} name="budgetMax" rules={{ required: 'Required' }}
              render={({ field: { onChange, value } }) => (
                <Input label="Budget Max (₹)" keyboardType="number-pad" placeholder="1000" value={value} onChangeText={onChange} error={errors.budgetMax?.message} />
              )}
            />
          </View>
        </View>
        <Controller control={control} name="deadline" rules={{ required: 'Required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Required by Date *" placeholder="YYYY-MM-DD" value={value} onChangeText={onChange} error={errors.deadline?.message} hint="Format: YYYY-MM-DD" />
          )}
        />
        <Controller control={control} name="requirements" rules={{ required: 'Required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Specific Requirements *" multiline numberOfLines={5} style={{ minHeight: 110, textAlignVertical: 'top' }} placeholder="Describe material, dimensions, packaging, certifications needed..." value={value} onChangeText={onChange} error={errors.requirements?.message} />
          )}
        />
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Button label="Post Request" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </SafeAreaView>
  );
}
