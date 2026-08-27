import React from 'react';
import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';

interface OfflineBannerProps {
  isSyncing?: boolean;
  queueCount?: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isSyncing = false,
  queueCount = 0,
}) => {
  if (isSyncing) {
    return (
      <View
        style={{
          backgroundColor: 'rgba(91,110,78,0.12)',
          borderBottomWidth: 1,
          borderBottomColor: '#5B6E4E',
          paddingHorizontal: 20,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#5B6E4E' }} />
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5B6E4E' }}>
          Syncing {queueCount} pending {queueCount === 1 ? 'change' : 'changes'}...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: 'rgba(181,80,47,0.08)',
        borderBottomWidth: 1,
        borderBottomColor: '#B5502F',
        paddingHorizontal: 20,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <WifiOff size={14} color="#B5502F" strokeWidth={1.5} />
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#B5502F' }}>
        You are offline. Changes will be saved locally.
        {queueCount > 0 && ` (${queueCount} queued)`}
      </Text>
    </View>
  );
};
