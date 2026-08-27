import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MessageCircle, CheckCircle } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ORDER } from '../../../mocks/seed';

export default function ArtisanOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = ORDER;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Order Details" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Order header */}
        <View style={{ paddingVertical: 16, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#8A726B' }}>{order.displayId}</Text>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, backgroundColor: 'rgba(181,80,47,0.08)' }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#B5502F' }}>{order.statusLabel}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#2B2420' }}>{order.productName}</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C' }}>From {order.buyerName}</Text>
        </View>

        {/* Financial summary */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420', marginBottom: 14 }}>Payment Summary</Text>
          {[
            { label: 'Quantity', value: `${order.quantity} units` },
            { label: 'Price per unit', value: `₹${order.unitPrice}` },
            { label: 'Total Amount', value: order.totalLabel, highlight: true },
            { label: 'Advance Paid', value: `₹${order.advancePaid.toLocaleString('en-IN')}`, color: '#5B6E4E' },
            { label: 'Balance Due', value: `₹${order.balanceDue.toLocaleString('en-IN')}`, color: '#B5502F' },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>{item.label}</Text>
              <Text style={{ fontFamily: item.highlight ? 'Inter_600SemiBold' : 'Inter_500Medium', fontSize: item.highlight ? 16 : 13, color: (item as any).color || '#2B2420' }}>
                {item.value}
              </Text>
            </View>
          ))}
        </Card>

        {/* Timeline */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420', marginBottom: 16 }}>Order Timeline</Text>
          {order.milestones.map((m, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 14, marginBottom: i < order.milestones.length - 1 ? 20 : 0 }}>
              <View style={{ alignItems: 'center', gap: 0 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: m.done ? '#B5502F' : '#FFFDF8', borderWidth: 1.5, borderColor: m.done ? '#B5502F' : '#E4D8C3', alignItems: 'center', justifyContent: 'center' }}>
                  {m.done && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' }} />}
                </View>
                {i < order.milestones.length - 1 && (
                  <View style={{ width: 1.5, height: 20, backgroundColor: m.done ? '#B5502F' : '#E4D8C3', marginTop: 2 }} />
                )}
              </View>
              <View style={{ flex: 1, paddingTop: 1, gap: 2 }}>
                <Text style={{ fontFamily: m.done ? 'Inter_500Medium' : 'Inter_400Regular', fontSize: 13, color: m.done ? '#2B2420' : '#8A726B' }}>{m.label}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#B8A9A5' }}>{m.date}</Text>
              </View>
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
          <Button label="Update Status" onPress={() => {}} />
        </View>
      </View>
    </SafeAreaView>
  );
}
