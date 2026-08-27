import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AIBadge } from '../../components/ui/AIBadge';
import { sendOffer } from '../../services/api';
import { BUYER_REQUEST } from '../../mocks/seed';

type OfferFormData = {
  quantity: string;
  pricePerUnit: string;
  deliveryWeeks: string;
  message: string;
};

export default function CreateOfferScreen() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const request = BUYER_REQUEST;

  const { control, handleSubmit, formState: { errors } } = useForm<OfferFormData>({
    defaultValues: {
      quantity: String(request.quantity),
      pricePerUnit: '850',
      deliveryWeeks: '6',
      message: `Namaste! I can fulfil your requirement for ${request.quantity} units of ${request.productType}. I have 8 years of experience in this craft and use traditional techniques from Madhubani. Please review my offer.`,
    },
  });

  const onSubmit = async (data: OfferFormData) => {
    setLoading(true);
    try {
      await sendOffer({
        requestId: request.id,
        quantity: parseInt(data.quantity),
        pricePerUnit: parseInt(data.pricePerUnit),
        deliveryDate: new Date(Date.now() + parseInt(data.deliveryWeeks) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        message: data.message,
      });
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ gap: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 64 }}>📤</Text>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#2B2420', textAlign: 'center' }}>Offer Sent!</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#56423C', textAlign: 'center', lineHeight: 22 }}>
            Your offer has been sent to {request.buyerName}. They will review and respond within 48 hours.
          </Text>
          <View style={{ width: '100%', gap: 10 }}>
            <Button label="View My Orders" onPress={() => router.replace('/(artisan)/orders')} />
            <Button label="Back to Buyers" onPress={() => router.replace('/(artisan)/buyers')} variant="secondary" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Create Offer" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        {/* Buyer summary */}
        <View style={{ backgroundColor: 'rgba(181,80,47,0.06)', borderRadius: 12, borderWidth: 1, borderColor: '#B5502F', padding: 16, marginVertical: 16, gap: 8 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}>{request.title}</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C' }}>{request.buyerName} · {request.quantity} units · {request.budgetLabel}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AIBadge label={`${request.matchScore}% Match`} variant="match" />
          </View>
        </View>

        <View style={{ gap: 20 }}>
          <Controller control={control} name="quantity" rules={{ required: 'Quantity is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Quantity you can supply *" keyboardType="number-pad" placeholder="500" value={value} onChangeText={onChange} error={errors.quantity?.message} hint="Buyer wants: " />
            )}
          />
          <Controller control={control} name="pricePerUnit" rules={{ required: 'Price is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Price per unit (₹) *" keyboardType="number-pad" placeholder="850" value={value} onChangeText={onChange} error={errors.pricePerUnit?.message} hint={`Buyer's budget: ${request.budgetLabel}`} />
            )}
          />
          <Controller control={control} name="deliveryWeeks" rules={{ required: 'Delivery time is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Delivery in (weeks) *" keyboardType="number-pad" placeholder="6" value={value} onChangeText={onChange} error={errors.deliveryWeeks?.message} />
            )}
          />
          <Controller control={control} name="message" rules={{ required: 'Message is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Message to Buyer *" multiline numberOfLines={5} style={{ minHeight: 110, textAlignVertical: 'top' }} value={value} onChangeText={onChange} error={errors.message?.message} />
            )}
          />
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Button label="Send Offer" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </SafeAreaView>
  );
}
