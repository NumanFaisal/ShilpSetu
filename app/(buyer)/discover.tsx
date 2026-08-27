import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search as SearchIcon, LayoutGrid } from 'lucide-react-native';
import { Header } from '../../components/ui/Header';
import { ProductCard } from '../../components/ui/ProductCard';
import { CRAFT_ICON_MAP } from '../../components/icons/CraftIcons';
import { getDiscoverProducts } from '../../services/api';
import { DISCOVER_PRODUCTS, CRAFT_CATEGORIES } from '../../mocks/seed';

export default function BuyerDiscoverScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState(DISCOVER_PRODUCTS as any[]);

  const handleSearch = async (q: string) => {
    setSearch(q);
    const result = await getDiscoverProducts({ category: selectedCategory, search: q });
    setProducts(result as any[]);
  };

  const handleCategorySelect = async (id: string) => {
    setSelectedCategory(id);
    const result = await getDiscoverProducts({ category: id, search });
    setProducts(result as any[]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }} edges={['top']}>
      <Header title="Discover Crafts" showBack={false} />

      {/* Search bar */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#FFFDF8',
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: '#E4D8C3',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <SearchIcon size={18} color="#8A726B" strokeWidth={1.5} />
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Search crafts, materials, regions..."
            placeholderTextColor="#B8A9A5"
            style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2B2420' }}
          />
        </View>
      </View>

      {/* Category section header */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Craft Categories
        </Text>
      </View>

      {/* Category Chips with Icons */}
      <View style={{ marginBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4, gap: 10, alignItems: 'center' }}
        >
          {/* 'All Categories' Chip */}
          <TouchableOpacity
            onPress={() => handleCategorySelect('all')}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 9999,
              borderWidth: 1.5,
              borderColor: selectedCategory === 'all' ? '#5B6E4E' : '#E4D8C3',
              backgroundColor: selectedCategory === 'all' ? 'rgba(91,110,78,0.1)' : '#FFFDF8',
            }}
          >
            <LayoutGrid size={16} color={selectedCategory === 'all' ? '#5B6E4E' : '#8A726B'} strokeWidth={1.8} />
            <Text
              style={{
                fontFamily: selectedCategory === 'all' ? 'Inter_600SemiBold' : 'Inter_500Medium',
                fontSize: 13,
                color: selectedCategory === 'all' ? '#5B6E4E' : '#56423C',
              }}
            >
              All Crafts
            </Text>
          </TouchableOpacity>

          {/* Dynamic Category Chips with Craft Icons */}
          {CRAFT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComp = CRAFT_ICON_MAP[cat.id] || CRAFT_ICON_MAP.default;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => handleCategorySelect(cat.id)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 9999,
                  borderWidth: 1.5,
                  borderColor: isSelected ? '#5B6E4E' : '#E4D8C3',
                  backgroundColor: isSelected ? 'rgba(91,110,78,0.1)' : '#FFFDF8',
                }}
              >
                <IconComp size={16} color={isSelected ? '#5B6E4E' : '#8A726B'} strokeWidth={1.8} />
                <Text
                  style={{
                    fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_500Medium',
                    fontSize: 13,
                    color: isSelected ? '#5B6E4E' : '#56423C',
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {products.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
            <Text style={{ fontSize: 36 }}>🔍</Text>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#2B2420' }}>No products found</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', textAlign: 'center' }}>
              Try selecting another category or refining your search keywords.
            </Text>
          </View>
        ) : (
          products.map((p: any) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              category={p.category}
              images={p.images || []}
              matchScore={p.matchScore}
              origin={p.origin}
              variant="discover"
              onPress={() => router.push(`/(buyer)/product/${p.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
