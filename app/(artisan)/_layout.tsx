import { Tabs } from 'expo-router';
import { Home, Package, Users, ShoppingBag, User } from 'lucide-react-native';
import { View, Text, Platform } from 'react-native';

const TAB_ITEMS = [
  { name: 'home', label: 'Home', Icon: Home },
  { name: 'products', label: 'Products', Icon: Package },
  { name: 'buyers', label: 'Buyers', Icon: Users },
  { name: 'orders', label: 'Orders', Icon: ShoppingBag },
  { name: 'profile', label: 'Profile', Icon: User },
];

export default function ArtisanTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFDF8',
          borderTopWidth: 1,
          borderTopColor: '#E4D8C3',
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#B5502F',
        tabBarInactiveTintColor: '#8A726B',
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      {TAB_ITEMS.map(({ name, label, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -6,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: '#B5502F',
                    }}
                  />
                )}
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
