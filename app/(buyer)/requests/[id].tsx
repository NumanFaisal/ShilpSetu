import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { BUYER_REQUEST, ARTISAN } from '../../../mocks/seed';

export default function BuyerRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const req = BUYER_REQUEST;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Request Details" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#2B2420', flex: 1 }}>{req.title}</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, backgroundColor: 'rgba(91,110,78,0.1)' }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#5B6E4E' }}>Active</Text>
          </View>
        </View>

        <Card style={{ marginBottom: 16 }}>
          {[
            { label: 'Product Type', value: req.productType },
            { label: 'Quantity', value: `${req.quantity.toLocaleString('en-IN')} units` },
            { label: 'Budget', value: req.budgetLabel },
            { label: 'Deadline', value: req.deadlineLabel },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>{item.label}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>{item.value}</Text>
            </View>
          ))}
        </Card>

        {/* Offers received */}
        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420', marginBottom: 12 }}>Offers Received ({req.offersCount || 3})</Text>
        {[
          { artisan: ARTISAN.name, location: ARTISAN.location, qty: req.quantity, price: '₹850/unit', delivery: '6 weeks', rating: '4.9' },
          { artisan: 'Rajan Mistri', location: 'Rajasthan', qty: req.quantity, price: '₹780/unit', delivery: '8 weeks', rating: '4.7' },
        ].map((offer, i) => (
          <Card key={i} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ gap: 2, flex: 1 }}>
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420' }}>{offer.artisan}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>{offer.location} · ⭐ {offer.rating}</Text>
              </View>
              <View style={{ gap: 2, alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#2B2420' }}>{offer.price}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>{offer.delivery}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => router.push('/chat/thread-001' as any)}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E4D8C3', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
              >
                <MessageCircle size={14} color="#56423C" strokeWidth={1.5} />
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#56423C' }}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#5B6E4E', alignItems: 'center' }}
                onPress={() => router.push('/(buyer)/orders')}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFF' }}>Accept Offer</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
