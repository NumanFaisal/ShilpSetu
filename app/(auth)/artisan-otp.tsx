import React, { useState, useRef, useEffect } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { verifyOTP } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { ARTISAN } from '../../mocks/seed';

export default function ArtisanOTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef<Array<TextInput | null>>([]);
  const { setUserRole, setAuthToken, setArtisan } = useAppStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (text: string, idx: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = digit;
    setOtp(newOtp);
    setError('');
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
    if (!digit && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const result = await verifyOTP(phone || '+91 98765 43210', code, 'artisan');
      setAuthToken(result.token);
      setUserRole('artisan');
      setArtisan(ARTISAN as any);
      if (result.isNewUser) {
        router.replace('/(artisan-onboarding)/profile-setup');
      } else {
        router.replace('/(artisan)/home');
      }
    } catch (e: any) {
      setError(e.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32, gap: 32 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 1 }}>
              Verify OTP
            </Text>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#2B2420', lineHeight: 36 }}>
              Enter the code sent to
            </Text>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 18, color: '#B5502F' }}>
              {phone || '+91 98765 43210'}
            </Text>
          </View>

          {/* OTP Boxes */}
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputs.current[i] = ref; }}
                value={digit}
                onChangeText={(t) => handleOtpChange(t, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 48,
                  height: 56,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: digit ? '#B5502F' : error ? '#9C4A3C' : '#E4D8C3',
                  backgroundColor: '#FFFDF8',
                  textAlign: 'center',
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 22,
                  color: '#2B2420',
                }}
              />
            ))}
          </View>

          {error && (
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#9C4A3C', textAlign: 'center' }}>
              {error}
            </Text>
          )}

          <Button label="Verify & Continue" onPress={handleVerify} loading={loading} />

          {/* Resend */}
          <TouchableOpacity
            disabled={resendTimer > 0}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: resendTimer > 0 ? '#B8A9A5' : '#B5502F' }}>
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>

          {/* Demo hint */}
          <View
            style={{
              backgroundColor: 'rgba(91,110,78,0.08)',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#5B6E4E',
              padding: 14,
              gap: 4,
            }}
          >
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#5B6E4E' }}>
              Demo Mode
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#56423C' }}>
              Enter any 6-digit number to continue. E.g., 123456
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
