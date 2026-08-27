import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AIBadge } from './AIBadge';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  status?: 'active' | 'draft' | 'archived';
  images?: string[];
  views?: number;
  inquiries?: number;
  matchScore?: number;
  onPress?: () => void;
  variant?: 'artisan' | 'buyer' | 'discover';
  craftType?: string;
  origin?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  category,
  status = 'active',
  images = [],
  views,
  inquiries,
  matchScore,
  onPress,
  variant = 'artisan',
  craftType,
  origin,
}) => {
  const handlePress = () => {
    if (onPress) onPress();
    else if (variant === 'artisan') router.push(`/(artisan)/products/${id}` as any);
    else router.push(`/(buyer)/product/${id}` as any);
  };

  const statusConfig = {
    active: { label: 'Active', bg: 'rgba(91,110,78,0.1)', text: '#5B6E4E' },
    draft: { label: 'Draft', bg: 'rgba(138,114,107,0.1)', text: '#8A726B' },
    archived: { label: 'Archived', bg: 'rgba(43,36,32,0.08)', text: '#56423C' },
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
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      {/* Product Image */}
      {images.length > 0 && (
        <Image
          source={{ uri: images[0] }}
          style={{ width: '100%', height: 180, backgroundColor: '#F8EAE4' }}
          resizeMode="cover"
        />
      )}
      {images.length === 0 && (
        <View
          style={{
            width: '100%',
            height: 140,
            backgroundColor: '#F6EEDF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 32 }}>🧺</Text>
        </View>
      )}

      <View style={{ padding: 16, gap: 8 }}>
        {/* Category + Status row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: '#8A726B',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            {category}
          </Text>
          {variant === 'artisan' && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 9999,
                backgroundColor: sc.bg,
              }}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: sc.text }}>
                {sc.label}
              </Text>
            </View>
          )}
          {matchScore && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 9999,
                backgroundColor: 'rgba(181,80,47,0.08)',
              }}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#B5502F' }}>
                {matchScore}% match
              </Text>
            </View>
          )}
        </View>

        {/* Product Name */}
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 16,
            lineHeight: 22,
            color: '#2B2420',
          }}
          numberOfLines={2}
        >
          {name}
        </Text>

        {/* Origin if available */}
        {origin && (
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>
            {origin}
          </Text>
        )}

        {/* Price row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 18,
              color: '#2B2420',
            }}
          >
            ₹{price.toLocaleString('en-IN')}
          </Text>

          {(views !== undefined || inquiries !== undefined) && (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {views !== undefined && (
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>
                  {views} views
                </Text>
              )}
              {inquiries !== undefined && (
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#B5502F' }}>
                  {inquiries} inquiries
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
