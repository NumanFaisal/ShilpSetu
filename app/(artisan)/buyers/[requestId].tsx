import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { AIBadge } from '../../../components/ui/AIBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { BUYER_REQUEST, BUYER } from '../../../mocks/seed';

export default function BuyerRequestDetailScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const req = BUYER_REQUEST;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Buyer Request" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Match score banner */}
        <View style={{ backgroundColor: 'rgba(181,80,47,0.06)', borderRadius: 12, borderWidth: 1, borderColor: '#B5502F', padding: 16, marginVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#B5502F', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#FFFFFF' }}>{req.matchScore}%</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}>Match Score</Text>
              <AIBadge label="AI Matched" variant="match" />
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C' }}>
              Your craft profile strongly matches this buyer's requirements
            </Text>
          </View>
        </View>

        {/* Buyer info */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Buyer</Text>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#2B2420' }}>{BUYER.companyName}</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C', marginTop: 4 }}>{BUYER.location} · Verified Buyer</Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
            <View style={{ gap: 2 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#2B2420' }}>{BUYER.totalOrders}+</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B' }}>Orders placed</Text>
            </View>
          </View>
        </Card>

        {/* Request details */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420', marginBottom: 16 }}>{req.title}</Text>
          {[
            { label: 'Product Type', value: req.productType },
            { label: 'Quantity', value: `${req.quantity.toLocaleString('en-IN')} units` },
            { label: 'Budget per unit', value: req.budgetLabel },
            { label: 'Required by', value: req.deadlineLabel },
            { label: 'Category', value: req.category },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>{item.label}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420', flex: 1, textAlign: 'right' }}>{item.value}</Text>
            </View>
          ))}
        </Card>

        {/* Description */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420', marginBottom: 10 }}>Description</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', lineHeight: 22 }}>{req.description}</Text>
        </Card>

        {/* Requirements */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420', marginBottom: 12 }}>Requirements</Text>
          {req.requirements.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#B5502F', marginTop: 7 }} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C', flex: 1, lineHeight: 20 }}>{r}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      {/* Bottom actions */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={() => router.push('/chat/thread-001' as any)}
          style={{ width: 48, height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#E4D8C3', alignItems: 'center', justifyContent: 'center' }}
        >
          <MessageCircle size={20} color="#2B2420" strokeWidth={1.5} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Button label="Create Offer" onPress={() => router.push('/(artisan-flow)/create-offer')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
