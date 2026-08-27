import React, { useState } from 'react';
import { SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../../components/ui/Header';
import { OrderCard } from '../../../components/ui/OrderCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { getOrders } from '../../../services/api';
import { useAppStore } from '../../../store/useAppStore';
import { ORDER } from '../../../mocks/seed';

export default function ArtisanOrdersScreen() {
  const { simulateEmptyOrders } = useAppStore();
  const [orders, setOrders] = useState(simulateEmptyOrders ? [] : [ORDER]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await getOrders({ simulateEmpty: simulateEmptyOrders });
    setOrders(data as any[]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="My Orders" showBack={false} showNotification />
      {orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" subtitle="When buyers place orders for your products, they will appear here." />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B5502F" />}
        >
          {orders.map((order: any) => (
            <OrderCard
              key={order.id}
              id={order.id}
              displayId={order.displayId}
              productName={order.productName}
              buyerName={order.buyerName}
              quantity={order.quantity}
              totalLabel={order.totalLabel}
              status={order.status}
              expectedDelivery={order.expectedDelivery}
              userRole="artisan"
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
