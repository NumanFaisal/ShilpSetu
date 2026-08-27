import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  icon,
}) => {
  const baseStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
    gap: 8,
  };

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const variantStyles = {
    primary: {
      container: {
        backgroundColor: disabled ? '#DCC4BB' : '#B5502F',
      },
      text: { color: '#FFFFFF' },
    },
    secondary: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: disabled ? '#DCC4BB' : '#B5502F',
      },
      text: { color: disabled ? '#DCC4BB' : '#B5502F' },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: disabled ? '#B8A9A5' : '#2B2420' },
    },
  };

  const textSizes = {
    sm: { fontSize: 13, lineHeight: 18 },
    md: { fontSize: 15, lineHeight: 22 },
    lg: { fontSize: 16, lineHeight: 24 },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        baseStyle,
        sizeStyles[size],
        variantStyles[variant].container,
        fullWidth && { width: '100%' as any },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#FFFFFF' : '#B5502F'} />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text
            style={[
              {
                fontFamily: 'Inter_500Medium',
                letterSpacing: 0.2,
                ...textSizes[size],
                ...variantStyles[variant].text,
              },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
