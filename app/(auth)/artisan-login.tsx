import React, { useState } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { sendOTP } from '../../services/api';

export default function ArtisanLoginScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOTP(phone);
      router.push({ pathname: '/(auth)/artisan-otp', params: { phone } });
    } catch (e) {
      setError('Failed to send OTP. Please try again.');
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
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header text */}
          <View style={{ marginBottom: 40, gap: 8 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 1 }}>
              Artisan Login
            </Text>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 30, color: '#2B2420', lineHeight: 38 }}>
              Welcome back,{'\n'}Kaarigaar
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#56423C', lineHeight: 22 }}>
              Enter your mobile number to receive a one-time password.
            </Text>
          </View>

          {/* Phone input */}
          <View style={{ gap: 24 }}>
            <Input
              label="Mobile Number"
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(t) => { setPhone(t); setError(''); }}
              error={error}
              maxLength={13}
            />

            <Button
              label="Send OTP"
              onPress={handleSendOTP}
              loading={loading}
              disabled={phone.length < 10}
            />
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 28 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E4D8C3' }} />
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>New to ShilpSetu?</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E4D8C3' }} />
          </View>

          <Button
            label="Register as Artisan"
            onPress={() => router.push('/(auth)/artisan-otp')}
            variant="secondary"
          />

          {/* Switch to buyer */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/buyer-login')}
            style={{ marginTop: 24, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>
              Are you a buyer?{' '}
              <Text style={{ color: '#B5502F', fontFamily: 'Inter_500Medium' }}>Sign in as Buyer</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
