import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🧺',
  title,
  subtitle,
  ctaLabel,
  onCta,
}) => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
        gap: 16,
      }}
    >
      {/* Illustration */}
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#F6EEDF',
          borderWidth: 1,
          borderColor: '#E4D8C3',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 42 }}>{icon}</Text>
      </View>

      <Text
        style={{
          fontFamily: 'Fraunces_600SemiBold',
          fontSize: 22,
          color: '#2B2420',
          textAlign: 'center',
          lineHeight: 28,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          color: '#56423C',
          textAlign: 'center',
          lineHeight: 22,
        }}
      >
        {subtitle}
      </Text>

      {ctaLabel && onCta && (
        <View style={{ width: '100%', marginTop: 8 }}>
          <Button label={ctaLabel} onPress={onCta} variant="primary" />
        </View>
      )}
    </View>
  );
};
