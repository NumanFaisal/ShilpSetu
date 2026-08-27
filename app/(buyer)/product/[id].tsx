import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MessageCircle, Share2 } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { AIBadge } from '../../../components/ui/AIBadge';
import { Card } from '../../../components/ui/Card';
import { PRODUCT } from '../../../mocks/seed';

export default function BuyerProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = PRODUCT;
  const [activeImage, setActiveImage] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Product Details" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Image */}
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
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i === activeImage ? '#5B6E4E' : 'rgba(255,255,255,0.7)' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 20 }}>
          {/* Category + certifications */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.8 }}>{product.category}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {product.certifications.slice(0, 2).map((c) => (
                <View key={c} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: 'rgba(91,110,78,0.1)', borderWidth: 1, borderColor: '#5B6E4E' }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#5B6E4E' }}>{c}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Name + Price */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 26, color: '#2B2420', lineHeight: 32 }}>{product.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 28, color: '#2B2420' }}>₹{product.price.toLocaleString('en-IN')}</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>/ unit</Text>
            </View>
          </View>

          {/* Artisan info */}
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F6EEDF', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>🧶</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420' }}>{product.artisanName}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C' }}>{product.artisanLocation} · {product.artisanExperience} years experience</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/chat/thread-001' as any)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F6EEDF', borderWidth: 1, borderColor: '#E4D8C3', alignItems: 'center', justifyContent: 'center' }}
              >
                <MessageCircle size={16} color="#5B6E4E" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* AI Description */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>About this Craft</Text>
              <AIBadge label="AI Written" />
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', lineHeight: 22 }}>{product.aiDescription}</Text>
          </View>

          {/* Details */}
          <Card>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420', marginBottom: 14 }}>Specifications</Text>
            {[
              { key: 'Material', value: product.material },
              { key: 'Dimensions', value: product.size },
              { key: 'Weight', value: product.weight },
              { key: 'Origin', value: product.origin },
              { key: 'Craft Technique', value: product.craftType },
              { key: 'MOQ', value: `${product.moq} units` },
            ].map((d) => (
              <View key={d.key} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>{d.key}</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>{d.value}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E4D8C3', alignItems: 'center', justifyContent: 'center' }}>
          <Share2 size={20} color="#2B2420" strokeWidth={1.5} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Button label="Request Bulk Quote" onPress={() => router.push('/bulk-request')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
