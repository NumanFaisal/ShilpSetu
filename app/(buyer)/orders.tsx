import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { OrderCard } from '../../components/ui/OrderCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { getOrders } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

export default function BuyerOrdersScreen() {
  const { simulateEmptyOrders } = useAppStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function fetchOrders() {
      try {
        const data = await getOrders({ asBuyer: true, simulateEmpty: simulateEmptyOrders, signal: controller.signal });
        if (isMounted) {
          setOrders(data || []);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[BuyerOrdersScreen] fetch error:', err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [simulateEmptyOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getOrders({ asBuyer: true, simulateEmpty: simulateEmptyOrders });
      setOrders(data || []);
    } catch (e: any) {
      console.warn('[BuyerOrdersScreen] refresh error:', e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const normalizeStatus = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    if (['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'completed'].includes(s)) {
      return s as any;
    }
    return 'pending';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="My Orders" showBack={false} showNotification />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#B5502F" />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          subtitle="When you place orders with artisans, they'll appear here."
          ctaLabel="Discover Crafts"
          onCta={() => router.push('/(buyer)/discover')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B5502F" />}
        >
          {orders.map((order: any) => (
            <OrderCard
              key={order.id}
              id={String(order.id)}
              displayId={order.displayId || `#SS${order.id}`}
              productName={order.productName || 'Handcrafted Product'}
              artisanName={order.artisanName}
              quantity={order.quantity || 1}
              totalLabel={order.totalLabel || `₹${order.totalAmount || 0}`}
              status={normalizeStatus(order.status)}
              expectedDelivery={order.expectedDeliveryLabel || order.expectedDelivery}
              userRole="buyer"
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
