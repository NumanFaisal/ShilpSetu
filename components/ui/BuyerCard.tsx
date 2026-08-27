import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface BuyerCardProps {
  id: string;
  buyerName: string;
  buyerLocation: string;
  title: string;
  quantity: number;
  budgetLabel: string;
  deadlineLabel: string;
  matchScore: number;
  status: 'active' | 'matched' | 'closed';
  onPress?: () => void;
  variant?: 'artisan' | 'buyer'; // artisan sees match score; buyer sees their own request
}

export const BuyerCard: React.FC<BuyerCardProps> = ({
  id,
  buyerName,
  buyerLocation,
  title,
  quantity,
  budgetLabel,
  deadlineLabel,
  matchScore,
  status,
  onPress,
  variant = 'artisan',
}) => {
  const handlePress = () => {
    if (onPress) onPress();
    else if (variant === 'artisan') router.push(`/(artisan)/buyers/${id}` as any);
    else router.push(`/(buyer)/requests/${id}` as any);
  };

  const statusConfig = {
    active: { label: 'Active', color: '#5B6E4E', bg: 'rgba(91,110,78,0.1)' },
    matched: { label: 'Matched', color: '#B5502F', bg: 'rgba(181,80,47,0.08)' },
    closed: { label: 'Closed', color: '#8A726B', bg: 'rgba(138,114,107,0.1)' },
  };
  const sc = statusConfig[status];

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
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 15,
              color: '#2B2420',
              lineHeight: 20,
            }}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>
            {buyerName} · {buyerLocation}
          </Text>
        </View>

        {/* Match score (artisan view) or status badge (buyer view) */}
        {variant === 'artisan' ? (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 9999,
              backgroundColor: '#B5502F',
              marginLeft: 12,
            }}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' }}>
              {matchScore}%
            </Text>
          </View>
        ) : (
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
        )}
      </View>

      {/* Details row */}
      <View
        style={{
          flexDirection: 'row',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <View style={{ gap: 2 }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Quantity
          </Text>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2B2420' }}>
            {quantity.toLocaleString('en-IN')} units
          </Text>
        </View>
        <View style={{ gap: 2 }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Budget
          </Text>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2B2420' }}>
            {budgetLabel}
          </Text>
        </View>
        <View style={{ gap: 2 }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Deadline
          </Text>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#2B2420' }}>
            {deadlineLabel}
          </Text>
        </View>
      </View>

      {/* CTA hint */}
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#B5502F' }}>
        {variant === 'artisan' ? 'Tap to view request & create offer →' : 'Tap to view details →'}
      </Text>
    </TouchableOpacity>
  );
};
