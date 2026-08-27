import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { BuyerCard } from '../../../components/ui/BuyerCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BUYER_REQUESTS_LIST } from '../../../mocks/seed';

export default function BuyerRequestsScreen() {
  const requests = BUYER_REQUESTS_LIST;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="My Requests" showBack={false} showNotification />
      {requests.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No requests yet"
          subtitle="Post a bulk request to get quotes from verified artisans across India."
          ctaLabel="Post a Request"
          onCta={() => router.push('/bulk-request')}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {requests.map((req) => (
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
              variant="buyer"
            />
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/bulk-request')}
        style={{ position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#5B6E4E', alignItems: 'center', justifyContent: 'center' }}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={1.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
