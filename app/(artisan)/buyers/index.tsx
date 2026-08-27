import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Header } from '../../../components/ui/Header';
import { BuyerCard } from '../../../components/ui/BuyerCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AIBadge } from '../../../components/ui/AIBadge';
import { getBuyerRequests } from '../../../services/api';
import { useAppStore } from '../../../store/useAppStore';
import { BUYER_REQUESTS_LIST } from '../../../mocks/seed';

export default function FindBuyersScreen() {
  const [requests, setRequests] = useState(BUYER_REQUESTS_LIST as any[]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await getBuyerRequests();
    setRequests(data as any[]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Find Buyers" showBack={false} showNotification />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B5502F" />}
      >
        {/* AI Match section header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#2B2420' }}>AI-Matched Buyers</Text>
          <AIBadge label="94% match" variant="match" />
        </View>

        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', lineHeight: 20, marginBottom: 16 }}>
          Buyers seeking products that match your craft profile, sorted by match score.
        </Text>

        {requests.length === 0 ? (
          <EmptyState icon="🔍" title="No buyer matches yet" subtitle="Complete your product listings to get matched with relevant buyers." />
        ) : (
          requests.map((req) => (
            <BuyerCard
              key={req.id}
              id={req.id}
              buyerName={req.buyerName}
              buyerLocation={req.buyerLocation}
              title={req.title}
              quantity={req.quantity}
              budgetLabel={req.budgetLabel}
              deadlineLabel={req.deadlineLabel}
              matchScore={req.matchScore}
              status={req.status}
              variant="artisan"
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
