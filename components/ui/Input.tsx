import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, style, ...props }) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 14,
            color: '#2B2420',
            lineHeight: 20,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor="#B8A9A5"
        style={[
          {
            backgroundColor: '#FFFDF8',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: error ? '#9C4A3C' : focused ? '#B5502F' : '#E4D8C3',
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontFamily: 'Inter_400Regular',
            fontSize: 15,
            color: '#2B2420',
            lineHeight: 22,
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: '#9C4A3C',
            lineHeight: 16,
          }}
        >
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: '#8A726B',
            lineHeight: 16,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
};
