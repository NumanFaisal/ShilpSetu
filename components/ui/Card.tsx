import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

/**
 * Card — uses 1px border (#E4D8C3) instead of shadows.
 * This is a deliberate design choice matching the ShilpSetu "printed paper" aesthetic.
 */
export const Card: React.FC<CardProps> = ({ children, style, padding = 'md' }) => {
  const paddingMap = {
    none: 0,
    sm: 12,
    md: 20,
    lg: 24,
  };

  return (
    <View
      style={[
        {
          backgroundColor: '#FFFDF8',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E4D8C3',
          padding: paddingMap[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
