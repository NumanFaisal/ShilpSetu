import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface OrderCardProps {
  id: string;
  displayId: string;
  productName: string;
  buyerName?: string;
  artisanName?: string;
  quantity: number;
  totalLabel: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'completed';
  expectedDelivery?: string;
  onPress?: () => void;
  userRole?: 'artisan' | 'buyer';
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#8A726B', bg: 'rgba(138,114,107,0.1)' },
  confirmed: { label: 'Confirmed', color: '#5B6E4E', bg: 'rgba(91,110,78,0.1)' },
  in_production: { label: 'In Production', color: '#B5502F', bg: 'rgba(181,80,47,0.08)' },
  shipped: { label: 'Shipped', color: '#5B6E4E', bg: 'rgba(91,110,78,0.12)' },
  delivered: { label: 'Delivered', color: '#5B6E4E', bg: 'rgba(91,110,78,0.15)' },
  completed: { label: 'Completed', color: '#2B2420', bg: 'rgba(43,36,32,0.08)' },
};

export const OrderCard: React.FC<OrderCardProps> = ({
  id,
  displayId,
  productName,
  buyerName,
  artisanName,
  quantity,
  totalLabel,
  status,
  expectedDelivery,
  onPress,
  userRole = 'artisan',
}) => {
  const sc = STATUS_CONFIG[status];

  const handlePress = () => {
    if (onPress) onPress();
    else if (userRole === 'artisan') router.push(`/(artisan)/orders/${id}` as any);
    else router.push(`/(buyer)/requests/${id}` as any);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{
        backgroundColor: '#FFFDF8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E4D8C3',
        padding: 16,
        marginBottom: 12,
        gap: 12,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#8A726B' }}>
          {displayId}
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 9999,
            backgroundColor: sc.bg,
          }}
        >
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: sc.color }}>
            {sc.label}
          </Text>
        </View>
      </View>

      {/* Product Name */}
      <Text
        style={{
          fontFamily: 'Fraunces_600SemiBold',
          fontSize: 16,
          color: '#2B2420',
          lineHeight: 22,
        }}
        numberOfLines={2}
      >
        {productName}
      </Text>

      {/* Counterpart name */}
      {buyerName && (
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C' }}>
          Buyer: {buyerName}
        </Text>
      )}
      {artisanName && (
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C' }}>
          Artisan: {artisanName}
        </Text>
      )}

      {/* Details */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C' }}>
          {quantity.toLocaleString('en-IN')} units
        </Text>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#2B2420' }}>
          {totalLabel}
        </Text>
      </View>

      {expectedDelivery && (
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>
          Expected delivery: {new Date(expectedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      )}
    </TouchableOpacity>
  );
};
