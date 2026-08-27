import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Share2, Archive, MessageCircle, ChevronRight } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { AIBadge } from '../../../components/ui/AIBadge';
import { Button } from '../../../components/ui/Button';
import { PRODUCT, BUYER_REQUEST } from '../../../mocks/seed';

export default function ArtisanProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = PRODUCT; // In real app: fetch by id
  const [activeImage, setActiveImage] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Product Details" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <View>
          <Image
            source={{ uri: product.images[activeImage] }}
            style={{ width: '100%', height: 280, backgroundColor: '#F6EEDF' }}
            resizeMode="cover"
          />
          {product.images.length > 1 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, position: 'absolute', bottom: 12, left: 0, right: 0 }}>
              {product.images.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i === activeImage ? '#B5502F' : 'rgba(255,255,255,0.7)' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 20 }}>
          {/* Category + Status */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {product.category}
            </Text>
            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: 'rgba(91,110,78,0.1)' }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#5B6E4E' }}>Active</Text>
            </View>
          </View>

          {/* Name + Price */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 26, color: '#2B2420', lineHeight: 32 }}>
              {product.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 28, color: '#2B2420' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B', textDecorationLine: 'line-through' }}>
                ₹{product.mrp.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {[
              { label: 'Views', value: String(product.views) },
              { label: 'Inquiries', value: String(product.inquiries) },
              { label: 'In Stock', value: String(product.quantity) },
            ].map((stat) => (
              <View key={stat.label} style={{ gap: 2 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#B5502F' }}>{stat.value}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* AI Description */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Description</Text>
              <AIBadge label="AI Written" />
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', lineHeight: 22 }}>
              {product.aiDescription}
            </Text>
          </View>

          {/* Details */}
          <View style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 16, gap: 12 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}>Product Details</Text>
            {[
              { key: 'Material', value: product.material },
              { key: 'Size', value: product.size },
              { key: 'Craft Type', value: product.craftType },
              { key: 'Origin', value: product.origin },
              { key: 'Weight', value: product.weight },
            ].map((detail) => (
              <View key={detail.key} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>{detail.key}</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>{detail.value}</Text>
              </View>
            ))}
          </View>

          {/* Buyer Matches */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Buyer Matches</Text>
            <TouchableOpacity
              onPress={() => router.push(`/(artisan)/buyers/${BUYER_REQUEST.id}` as any)}
              activeOpacity={0.8}
              style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <View style={{ gap: 2 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2B2420' }}>{BUYER_REQUEST.buyerName}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>{BUYER_REQUEST.quantity} units · {BUYER_REQUEST.budgetLabel}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, backgroundColor: '#B5502F' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' }}>{BUYER_REQUEST.matchScore}%</Text>
                </View>
                <ChevronRight size={16} color="#8A726B" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E4D8C3', alignItems: 'center', justifyContent: 'center' }}>
          <Share2 size={20} color="#2B2420" strokeWidth={1.5} />
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E4D8C3', alignItems: 'center', justifyContent: 'center' }}>
          <Archive size={20} color="#2B2420" strokeWidth={1.5} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Button label="Find Buyers" onPress={() => router.push('/(artisan)/buyers')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
