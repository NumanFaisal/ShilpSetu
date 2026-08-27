import { Redirect } from 'expo-router';
import { useAppStore } from '../store/useAppStore';

export default function Index() {
  const { isAuthenticated, userRole } = useAppStore();

  if (isAuthenticated && userRole === 'artisan') {
    return <Redirect href="/(artisan)/home" />;
  }

  if (isAuthenticated && userRole === 'buyer') {
    return <Redirect href="/(buyer)/home" />;
  }

  return <Redirect href="/splash" />;
}
