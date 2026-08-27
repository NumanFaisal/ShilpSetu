import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent, Modal, Switch } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotification?: boolean;
  rightElement?: React.ReactNode;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBack,
  showNotification = false,
  rightElement,
  transparent = false,
}) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debugVisible, setDebugVisible] = useState(false);
  const { toggleDebugFlag, simulateNetworkError, simulateAIError, simulateEmptyProducts, simulateEmptyOrders } =
    useAppStore();

  const handleTitlePressIn = () => {
    longPressTimer.current = setTimeout(() => setDebugVisible(true), 800);
  };

  const handleTitlePressOut = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 14,
          backgroundColor: transparent ? 'transparent' : '#FFF8F6',
          borderBottomWidth: transparent ? 0 : 1,
          borderBottomColor: '#E4D8C3',
        }}
      >
        {/* Left — Back button */}
        <View style={{ width: 40, alignItems: 'flex-start' }}>
          {showBack && (
            <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <ArrowLeft size={22} color="#2B2420" strokeWidth={1.5} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center — Title (long-press for debug menu) */}
        <TouchableOpacity
          onPressIn={handleTitlePressIn}
          onPressOut={handleTitlePressOut}
          activeOpacity={1}
          style={{ flex: 1, alignItems: 'center' }}
        >
          {title ? (
            <Text
              style={{
                fontFamily: 'Fraunces_600SemiBold',
                fontSize: 18,
                lineHeight: 24,
                color: '#2B2420',
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#B5502F' }}>
              ShilpSetu
            </Text>
          )}
        </TouchableOpacity>

        {/* Right — Notification bell or custom element */}
        <View style={{ width: 40, alignItems: 'flex-end' }}>
          {showNotification ? (
            <TouchableOpacity onPress={() => router.push('/notifications')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Bell size={22} color="#2B2420" strokeWidth={1.5} />
            </TouchableOpacity>
          ) : (
            rightElement || <View />
          )}
        </View>
      </View>

      {/* ─── Debug Menu Modal ──────────────────────────────────────────── */}
      <Modal
        visible={debugVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDebugVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(43,36,32,0.5)' }}
          onPress={() => setDebugVisible(false)}
          activeOpacity={1}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFDF8',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: 1,
            borderColor: '#E4D8C3',
            padding: 24,
            gap: 20,
          }}
        >
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#B5502F' }}>
            🛠 Debug Menu
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B' }}>
            Long-press the header title to open this menu
          </Text>
          {[
            { key: 'simulateNetworkError' as const, label: 'Simulate Network Error', value: simulateNetworkError },
            { key: 'simulateAIError' as const, label: 'Simulate AI Processing Error', value: simulateAIError },
            { key: 'simulateEmptyProducts' as const, label: 'Simulate Empty Products', value: simulateEmptyProducts },
            { key: 'simulateEmptyOrders' as const, label: 'Simulate Empty Orders', value: simulateEmptyOrders },
          ].map((item) => (
            <View
              key={item.key}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#2B2420' }}>
                {item.label}
              </Text>
              <Switch
                value={item.value}
                onValueChange={() => toggleDebugFlag(item.key)}
                trackColor={{ false: '#E4D8C3', true: '#B5502F' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
          <TouchableOpacity
            onPress={() => setDebugVisible(false)}
            style={{
              backgroundColor: '#B5502F',
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#FFFFFF' }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};
