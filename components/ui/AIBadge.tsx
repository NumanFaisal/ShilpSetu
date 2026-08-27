import React from 'react';
import { View, Text } from 'react-native';

interface AIBadgeProps {
  label?: string;
  variant?: 'suggested' | 'insight' | 'match';
}

/**
 * AIBadge — "AI Suggested" pill marker.
 * Sage hairline border, no sparkles or stars — per design system.
 * The AI is treated as a quiet craftsman's apprentice.
 */
export const AIBadge: React.FC<AIBadgeProps> = ({
  label = 'AI Suggested',
  variant = 'suggested',
}) => {
  const variantConfig = {
    suggested: {
      borderColor: '#5B6E4E',
      textColor: '#5B6E4E',
      bgColor: 'rgba(91,110,78,0.06)',
    },
    insight: {
      borderColor: '#5B6E4E',
      textColor: '#5B6E4E',
      bgColor: 'rgba(91,110,78,0.08)',
    },
    match: {
      borderColor: '#B5502F',
      textColor: '#B5502F',
      bgColor: 'rgba(181,80,47,0.06)',
    },
  };

  const config = variantConfig[variant];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: config.borderColor,
        backgroundColor: config.bgColor,
        gap: 4,
      }}
    >
      {/* Subtle dot instead of sparkle */}
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: config.textColor,
          opacity: 0.7,
        }}
      />
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          lineHeight: 16,
          color: config.textColor,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
};
