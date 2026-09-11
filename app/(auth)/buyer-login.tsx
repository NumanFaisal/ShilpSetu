import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { signIn, signUp } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { BUYER } from '../../mocks/seed';

export default function BuyerLoginScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUserRole, setAuthToken, setBuyer } = useAppStore();

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      setError('Please enter your business email or username');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please enter your company or contact name');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await signIn({
          identifier: identifier.trim(),
          password,
          role: 'buyer',
        });
        setAuthToken(result.token);
        setUserRole('buyer');
        setBuyer(BUYER as any);
        router.replace('/(buyer)/home');
      } else {
        const result = await signUp({
          name: name.trim(),
          identifier: identifier.trim(),
          password,
          role: 'buyer',
        });
        setAuthToken(result.token);
        setUserRole('buyer');
        setBuyer(BUYER as any);
        router.replace('/(buyer)/home');
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="" showBack onBack={() => router.push('/welcome')} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header text */}
          <View style={{ marginBottom: 28, gap: 8 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5B6E4E', textTransform: 'uppercase', letterSpacing: 1 }}>
              {mode === 'login' ? 'Buyer Sign In' : 'Buyer Registration'}
            </Text>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 30, color: '#2B2420', lineHeight: 38 }}>
              {mode === 'login' ? 'Source authentic Indian crafts' : 'Join as a Verified Buyer'}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#56423C', lineHeight: 22 }}>
              {mode === 'login'
                ? 'Sign in with your email or username to connect with verified artisans and place wholesale orders.'
                : 'Create an account to source handmade goods with AI-assisted cataloging and direct artisan pricing.'}
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#ECEAE4',
              borderRadius: 10,
              padding: 4,
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => { setMode('login'); setError(''); }}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: mode === 'login' ? '#FFFDF8' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: mode === 'login' ? '#5B6E4E' : '#8A726B',
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setMode('register'); setError(''); }}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: mode === 'register' ? '#FFFDF8' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: mode === 'register' ? '#5B6E4E' : '#8A726B',
                }}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Credentials Chip */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(91,110,78,0.06)', borderWidth: 1, borderColor: 'rgba(91,110,78,0.18)' }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#3E4E35' }}>
              💡 Tap to fill demo buyer credentials:
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIdentifier('vishal420@gmail.com');
                setPassword('123456');
                setError('');
              }}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#5B6E4E' }}>
                Auto-fill
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={{ gap: 16 }}>
            {mode === 'register' && (
              <Input
                label="Company or Contact Name"
                placeholder="e.g. FabIndia Wholesale / Ananya Roy"
                value={name}
                onChangeText={(t) => { setName(t); setError(''); }}
              />
            )}

            <Input
              label="Business Email or Username"
              placeholder="buyer@fabindia.com or fabindia_buyer"
              autoCapitalize="none"
              autoCorrect={false}
              value={identifier}
              onChangeText={(t) => { setIdentifier(t); setError(''); }}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              error={error}
            />

            <Button
              label={mode === 'login' ? 'Sign In as Buyer' : 'Create Buyer Account'}
              onPress={handleSubmit}
              loading={loading}
              disabled={!identifier || !password}
              variant="secondary"
            />
          </View>

          {/* Toggle Mode Link */}
          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            style={{ marginTop: 24, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={{ color: '#5B6E4E', fontFamily: 'Inter_600SemiBold' }}>
                {mode === 'login' ? 'Register here' : 'Sign in here'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E4D8C3' }} />
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>Or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E4D8C3' }} />
          </View>

          {/* Switch to artisan */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/artisan-login')}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>
              Are you an artisan?{' '}
              <Text style={{ color: '#B5502F', fontFamily: 'Inter_600SemiBold' }}>Sign in as Artisan</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
