import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronDown, ChevronUp, Phone, MessageSquare, Bot } from 'lucide-react-native';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const FAQS = [
  {
    q: 'How does AI help me set prices for my crafts?',
    a: 'ShilpSetu AI analyses thousands of similar craft listings, material costs, and current market demand across India to suggest competitive prices that ensure fair profit margins.',
  },
  {
    q: 'Can I add products if I don\'t know English?',
    a: 'Yes! You can speak about your craft in Hindi, Marathi, Bengali, Telugu, Tamil, or any of 10 supported Indian languages. AI will transcribe your voice and write the catalog in both English and your local language.',
  },
  {
    q: 'How do payments work for bulk orders?',
    a: 'Buyers pay an advance (usually 30–50%) upon order confirmation. The remaining balance is released upon milestone updates and final delivery verification.',
  },
  {
    q: 'What happens if I lose internet connection while using the app?',
    a: 'ShilpSetu is built to work offline. You can photograph products, draft descriptions, and accept orders without internet. Everything will sync automatically when you reconnect.',
  },
];

export default function HelpScreen() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Help & Support" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 24 }} showsVerticalScrollIndicator={false}>
        {/* Ask AI Assistant CTA */}
        <TouchableOpacity
          onPress={() => router.push('/chat/ai-assistant')}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#5B6E4E',
            borderRadius: 12,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={24} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#FFFFFF' }}>Ask AI Assistant</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Instant answers for pricing, orders & craft tips</Text>
          </View>
        </TouchableOpacity>

        {/* FAQs */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Frequently Asked Questions</Text>
          <View style={{ gap: 10 }}>
            {FAQS.map((faq, i) => {
              const isOpen = expanded === i;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setExpanded(isOpen ? null : i)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#FFFDF8',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E4D8C3',
                    padding: 16,
                    gap: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420', flex: 1, lineHeight: 20 }}>
                      {faq.q}
                    </Text>
                    {isOpen ? <ChevronUp size={18} color="#B5502F" /> : <ChevronDown size={18} color="#8A726B" />}
                  </View>
                  {isOpen && (
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C', lineHeight: 20, paddingTop: 4 }}>
                      {faq.a}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Contact Support */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Direct Support</Text>
          <Card>
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Phone size={18} color="#B5502F" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2B2420' }}>Artisan Helpline</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>Toll Free: 1800-123-SHILP (9am - 7pm)</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MessageSquare size={18} color="#5B6E4E" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2B2420' }}>WhatsApp Support</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>+91 98765 43210 (24/7 assistance)</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
