import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AIBadge } from '../../components/ui/AIBadge';
import { useAppStore } from '../../store/useAppStore';
import { PRODUCT } from '../../mocks/seed';

export default function CatalogReviewScreen() {
  const { draftProduct, updateDraftProduct } = useAppStore();
  const product = PRODUCT; // AI-generated mock

  const [name, setName] = useState<string>(draftProduct.name || product.name);
  const [description, setDescription] = useState<string>(product.aiDescription);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Review Catalog" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* AI Written badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#2B2420' }}>AI-Generated Catalog</Text>
          <AIBadge label="AI Written" />
        </View>

        {/* Photos */}
        {(draftProduct.images || [product.images[0]]).length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {(draftProduct.images || product.images).map((uri, i) => (
                <Image key={i} source={{ uri }} style={{ width: 110, height: 110, borderRadius: 10, backgroundColor: '#F6EEDF' }} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ gap: 20 }}>
          {/* Editable name */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2B2420' }}>Product Name</Text>
              <AIBadge label="AI Suggested" />
            </View>
            <Input value={name} onChangeText={setName} placeholder="Product name" />
          </View>

          {/* Product details */}
          <View style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 16, gap: 10 }}>
            {[
              { label: 'Category', value: product.category },
              { label: 'Material', value: product.material },
              { label: 'Craft Type', value: product.craftType },
              { label: 'Origin', value: product.origin },
            ].map((item) => (
              <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>{item.label}</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* AI description */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2B2420' }}>Description</Text>
              <AIBadge label="AI Written" />
            </View>
            <Input
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
          </View>

          {/* Tags */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2B2420' }}>Tags</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {product.tags.map((tag) => (
                <View key={tag} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, backgroundColor: '#F6EEDF', borderWidth: 1, borderColor: '#E4D8C3' }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#56423C' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', paddingHorizontal: 20, paddingVertical: 16, gap: 10 }}>
        <Button label="Set Price & Publish →" onPress={() => router.push('/(artisan-flow)/pricing')} />
      </View>
    </SafeAreaView>
  );
}
