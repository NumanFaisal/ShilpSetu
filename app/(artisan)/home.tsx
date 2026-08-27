import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Plus, ChevronRight, TrendingUp } from 'lucide-react-native';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { AIBadge } from '../../components/ui/AIBadge';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { useAppStore } from '../../store/useAppStore';
import { getAIInsights } from '../../services/api';
import { ARTISAN, ORDER, AI_INSIGHTS, BUYER_REQUEST } from '../../mocks/seed';

const StatCard = ({ value, label, sub }: { value: string; label: string; sub?: string }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: '#FFFDF8',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E4D8C3',
      padding: 16,
      gap: 4,
    }}
  >
    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 22, color: '#2B2420' }}>{value}</Text>
    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>{label}</Text>
    {sub && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#B5502F' }}>{sub}</Text>}
  </View>
);

export default function ArtisanHomeScreen() {
  const { isOnline, offlineQueue } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState(AI_INSIGHTS);

  const artisan = ARTISAN;

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      {!isOnline && <OfflineBanner queueCount={offlineQueue.length} />}
      <Header
        title=""
        showBack={false}
        showNotification
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B5502F" />}
      >
        {/* Greeting */}
        <View style={{ paddingTop: 12, gap: 4 }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>
            🙏 Namaste,
          </Text>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#2B2420', lineHeight: 34 }}>
            {artisan.name}
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C' }}>
            {artisan.location} · {artisan.crafts.join(', ')}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard value={String(artisan.productsCount)} label="Products Listed" />
            <StatCard value={String(artisan.activeOrders)} label="Active Orders" sub="In Production" />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard value={`₹${artisan.totalEarnings.toLocaleString('en-IN')}`} label="Total Earnings" />
            <StatCard value={String(artisan.pendingInquiries)} label="Pending Inquiries" sub="3 new today" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/(artisan-flow)/add-product')}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: '#B5502F',
                borderRadius: 12,
                padding: 16,
                gap: 8,
                alignItems: 'center',
              }}
            >
              <Plus size={22} color="#FFFFFF" strokeWidth={1.5} />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFF', textAlign: 'center' }}>
                Add Product
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(artisan)/buyers')}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: '#FFFDF8',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E4D8C3',
                padding: 16,
                gap: 8,
                alignItems: 'center',
              }}
            >
              <TrendingUp size={22} color="#B5502F" strokeWidth={1.5} />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420', textAlign: 'center' }}>
                Find Buyers
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Order highlight */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Active Order</Text>
          <TouchableOpacity
            onPress={() => router.push(`/(artisan)/orders/${ORDER.id}` as any)}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#FFFDF8',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E4D8C3',
              padding: 16,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#8A726B' }}>{ORDER.displayId}</Text>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: 'rgba(181,80,47,0.08)' }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#B5502F' }}>{ORDER.statusLabel}</Text>
              </View>
            </View>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420' }}>{ORDER.productName}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C' }}>{ORDER.buyerName} · {ORDER.quantity} units</Text>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#2B2420' }}>{ORDER.totalLabel}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#B5502F' }}>View Details</Text>
              <ChevronRight size={12} color="#B5502F" />
            </View>
          </TouchableOpacity>
        </View>

        {/* AI Insights */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>AI Insights</Text>
            <AIBadge label="Powered by AI" />
          </View>
          {insights.map((insight) => (
            <TouchableOpacity
              key={insight.id}
              onPress={() => insight.actionRoute && router.push(insight.actionRoute as any)}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#FFFDF8',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E4D8C3',
                padding: 16,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 9999,
                    backgroundColor: 'rgba(91,110,78,0.1)',
                  }}
                >
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#5B6E4E' }}>{insight.category}</Text>
                </View>
              </View>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420' }}>{insight.title}</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C', lineHeight: 18 }}>{insight.body}</Text>
              {insight.actionLabel && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#B5502F' }}>{insight.actionLabel}</Text>
                  <ChevronRight size={12} color="#B5502F" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Buyer Match highlight */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>Top Buyer Match</Text>
          <TouchableOpacity
            onPress={() => router.push(`/(artisan)/buyers/${BUYER_REQUEST.id}` as any)}
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
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420', flex: 1 }} numberOfLines={1}>
                {BUYER_REQUEST.buyerName}
              </Text>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, backgroundColor: '#B5502F' }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' }}>{BUYER_REQUEST.matchScore}%</Text>
              </View>
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C' }}>
              {BUYER_REQUEST.quantity} units · {BUYER_REQUEST.budgetLabel}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#B5502F' }}>View & Send Offer</Text>
              <ChevronRight size={12} color="#B5502F" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
