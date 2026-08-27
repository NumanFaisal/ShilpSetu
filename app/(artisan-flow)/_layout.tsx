import { Stack } from 'expo-router';

export default function ArtisanFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFF8F6' },
        animation: 'slide_from_right',
      }}
    />
  );
}
