import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Plus, ChevronRight } from 'lucide-react-native';
import { Header } from '../../components/ui/Header';
import { AIBadge } from '../../components/ui/AIBadge';
import { BUYER, DISCOVER_PRODUCTS, ORDER, BUYER_REQUESTS_LIST } from '../../mocks/seed';

export default function BuyerHomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const buyer = BUYER;

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="" showBack={false} showNotification />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B6E4E" />}
      >
        {/* Greeting */}
        <View style={{ paddingTop: 12, gap: 4 }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>Welcome back,</Text>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#2B2420' }}>{buyer.companyName}</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C' }}>{buyer.location} · Verified Buyer</Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { value: String(buyer.totalOrders), label: 'Total Orders' },
            { value: String(buyer.activeRequests), label: 'Active Requests' },
            { value: String(buyer.artisansConnected), label: 'Artisans' },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 14, gap: 4, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 22, color: '#5B6E4E' }}>{s.value}</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B', textAlign: 'center' }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.push('/bulk-request')}
            activeOpacity={0.8}
            style={{ flex: 1, backgroundColor: '#5B6E4E', borderRadius: 12, padding: 16, gap: 6, alignItems: 'center' }}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={1.5} />
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF', textAlign: 'center' }}>Post Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(buyer)/discover')}
            activeOpacity={0.8}
            style={{ flex: 1, backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 16, gap: 6, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 20 }}>🔍</Text>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#2B2420', textAlign: 'center' }}>Discover</Text>
          </TouchableOpacity>
        </View>

        {/* AI Recommendation */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Recommended for You</Text>
            <AIBadge label="AI Curated" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
            {DISCOVER_PRODUCTS.slice(0, 4).map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => router.push(`/(buyer)/product/${p.id}` as any)}
                activeOpacity={0.8}
                style={{ width: 160, backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', overflow: 'hidden' }}
              >
                <View style={{ height: 110, backgroundColor: '#F6EEDF', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 36 }}>🧺</Text>
                </View>
                <View style={{ padding: 12, gap: 4 }}>
                  <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 13, color: '#2B2420' }} numberOfLines={2}>{p.name}</Text>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#5B6E4E' }}>₹{p.price.toLocaleString('en-IN')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Order */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Recent Order</Text>
          <TouchableOpacity
            onPress={() => router.push(`/(buyer)/orders` as any)}
            activeOpacity={0.8}
            style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 16, gap: 10 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#8A726B' }}>{ORDER.displayId}</Text>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: 'rgba(181,80,47,0.08)' }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#B5502F' }}>{ORDER.statusLabel}</Text>
              </View>
            </View>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420' }}>{ORDER.productName}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C' }}>From Sita Devi · {ORDER.quantity} units</Text>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2B2420' }}>{ORDER.totalLabel}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Active Requests */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Active Requests</Text>
            <TouchableOpacity onPress={() => router.push('/(buyer)/requests')}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#5B6E4E' }}>View All</Text>
            </TouchableOpacity>
          </View>
          {BUYER_REQUESTS_LIST.slice(0, 2).map((req) => (
            <TouchableOpacity
              key={req.id}
              onPress={() => router.push(`/(buyer)/requests/${req.id}` as any)}
              activeOpacity={0.8}
              style={{ backgroundColor: '#FFFDF8', borderRadius: 12, borderWidth: 1, borderColor: '#E4D8C3', padding: 16, gap: 8 }}
            >
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 14, color: '#2B2420' }}>{req.title}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>{req.quantity} units · {req.budgetLabel}</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#B5502F' }}>{req.offersCount || 0} offers</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
