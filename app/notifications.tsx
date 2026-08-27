import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Bell, CheckCheck } from 'lucide-react-native';
import { Header } from '../components/ui/Header';
import { EmptyState } from '../components/ui/EmptyState';
import { NOTIFICATIONS } from '../mocks/seed';
import { markAllNotificationsRead } from '../services/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemPress = (n: typeof NOTIFICATIONS[0]) => {
    setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, read: true } : item));
    if (n.actionRoute) {
      router.push(n.actionRoute as any);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header
        title="Notifications"
        showBack
        rightElement={
          <TouchableOpacity onPress={handleMarkAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <CheckCheck size={20} color="#B5502F" strokeWidth={1.5} />
          </TouchableOpacity>
        }
      />
      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" subtitle="You're all caught up! Updates about orders and matches will appear here." />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B5502F" />}
        >
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.8}
              style={{
                backgroundColor: item.read ? '#FFFDF8' : 'rgba(181,80,47,0.04)',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: item.read ? '#E4D8C3' : '#B5502F',
                padding: 16,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420', flex: 1 }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B' }}>
                  {new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C', lineHeight: 18 }}>
                {item.body}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
