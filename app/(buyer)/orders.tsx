import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { OrderCard } from '../../components/ui/OrderCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ORDER } from '../../mocks/seed';
import { useAppStore } from '../../store/useAppStore';

export default function BuyerOrdersScreen() {
  const { simulateEmptyOrders } = useAppStore();
  const orders = simulateEmptyOrders ? [] : [{ ...ORDER, artisanName: 'Sita Devi' }];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="My Orders" showBack={false} showNotification />
      {orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" subtitle="When you place orders with artisans, they'll appear here." ctaLabel="Discover Crafts" onCta={() => router.push('/(buyer)/discover')} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {orders.map((order: any) => (
            <OrderCard
              key={order.id}
              id={order.id}
              displayId={order.displayId}
              productName={order.productName}
              artisanName={order.artisanName}
              quantity={order.quantity}
              totalLabel={order.totalLabel}
              status={order.status}
              expectedDelivery={order.expectedDelivery}
              userRole="buyer"
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
