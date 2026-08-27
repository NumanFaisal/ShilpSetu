import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
  retryLabel?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(43,36,32,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFDF8',
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#E4D8C3',
            padding: 28,
            width: '100%',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: 'rgba(156,74,60,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={26} color="#9C4A3C" strokeWidth={1.5} />
          </View>

          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 20,
              color: '#2B2420',
              textAlign: 'center',
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: '#56423C',
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {message}
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 4 }}>
            <TouchableOpacity
              onPress={onDismiss}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: '#B5502F',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#B5502F' }}>
                Cancel
              </Text>
            </TouchableOpacity>
            {onRetry && (
              <TouchableOpacity
                onPress={onRetry}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#B5502F',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#FFFFFF' }}>
                  {retryLabel}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
