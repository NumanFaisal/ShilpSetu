import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { ProductCard } from '../../../components/ui/ProductCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { getMyProducts } from '../../../services/api';
import { useAppStore } from '../../../store/useAppStore';
import { SAMPLE_PRODUCTS } from '../../../mocks/seed';

const FILTERS = ['All', 'Active', 'Draft', 'Archived'] as const;
type Filter = typeof FILTERS[number];

export default function MyProductsScreen() {
  const { simulateEmptyProducts } = useAppStore();
  const [filter, setFilter] = useState<Filter>('All');
  const [products, setProducts] = useState(SAMPLE_PRODUCTS as any[]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getMyProducts({ simulateEmpty: simulateEmptyProducts });
    setProducts(data as any[]);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, [simulateEmptyProducts]);

  const filtered = filter === 'All' ? products : products.filter((p) => p.status === filter.toLowerCase());

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="My Products" showBack={false} showNotification />

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
              borderWidth: 1.5,
              borderColor: filter === f ? '#B5502F' : '#E4D8C3',
              backgroundColor: filter === f ? 'rgba(181,80,47,0.08)' : '#FFFDF8',
            }}
          >
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: filter === f ? '#B5502F' : '#56423C' }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🧺"
          title="No products yet"
          subtitle="Start by adding your first handcrafted product. AI will help write the description."
          ctaLabel="Add Your First Product"
          onCta={() => router.push('/(artisan-flow)/add-product')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B5502F" />}
        >
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              category={product.category}
              status={product.status as any}
              images={product.images as any}
              views={product.views}
              inquiries={product.inquiries}
              variant="artisan"
            />
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(artisan-flow)/add-product')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#B5502F',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={1.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
