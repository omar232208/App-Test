import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const topPad = insets.top + 12;
  const botPad = insets.bottom + 32;

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/');
    } catch {
      setError('Registration failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setLoading(false);
  }

  const pwStrength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;

  const pwStrengthLabel = ['', 'Too short', 'Good', 'Strong'][pwStrength];
  const pwStrengthColor = ['', '#EF4444', '#F59E0B', '#22C55E'][pwStrength];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0A0818', '#110D22', '#05050A']} style={StyleSheet.absoluteFill} />
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: botPad }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Back */}
          <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={16} style={styles.backBtn}>
            <View style={styles.backCircle}>
              <Feather name="arrow-left" size={18} color="#fff" />
            </View>
          </Pressable>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="user-plus" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>Create account</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Start your developer journey today</Text>
          </Animated.View>

          {/* Error */}
          {!!error && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* Name */}
          <Animated.View entering={FadeInDown.delay(80).duration(500)}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Full Name</Text>
            <View style={styles.inputRow}>
              <Feather name="user" size={16} color="#ffffff55" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Alex Developer"
                placeholderTextColor="#ffffff33"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                returnKeyType="next"
                textContentType="name"
              />
            </View>
          </Animated.View>

          {/* Email */}
          <Animated.View entering={FadeInDown.delay(120).duration(500)}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email address</Text>
            <View style={styles.inputRow}>
              <Feather name="mail" size={16} color="#ffffff55" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#ffffff33"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                textContentType="emailAddress"
              />
            </View>
          </Animated.View>

          {/* Password */}
          <Animated.View entering={FadeInDown.delay(160).duration(500)}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={styles.inputRow}>
              <Feather name="lock" size={16} color="#ffffff55" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor="#ffffff33"
                secureTextEntry={!showPw}
                autoComplete="new-password"
                returnKeyType="done"
                textContentType="newPassword"
                onSubmitEditing={handleRegister}
              />
              <Pressable onPress={() => setShowPw(v => !v)} hitSlop={12} style={styles.eyeBtn}>
                <Feather name={showPw ? 'eye-off' : 'eye'} size={16} color="#ffffff55" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Password strength */}
          {password.length > 0 && (
            <Animated.View entering={FadeInDown.duration(250)} style={styles.strengthRow}>
              {[1, 2, 3].map(i => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    { backgroundColor: pwStrength >= i ? pwStrengthColor : '#ffffff15' },
                  ]}
                />
              ))}
              <Text style={[styles.strengthText, { color: pwStrengthColor }]}>{pwStrengthLabel}</Text>
            </Animated.View>
          )}

          {/* Terms */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={[styles.terms, { color: colors.mutedForeground }]}>
              By continuing, you agree to our{' '}
              <Text style={{ color: '#8B5CF6' }}>Terms</Text> &{' '}
              <Text style={{ color: '#8B5CF6' }}>Privacy Policy</Text>
            </Text>
          </Animated.View>

          {/* Create button */}
          <Animated.View entering={FadeInDown.delay(240).duration(500)}>
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => [styles.createWrap, { opacity: pressed || loading ? 0.8 : 1 }]}
            >
              <LinearGradient colors={['#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtn}>
                <Text style={styles.createText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
                {!loading && <Feather name="arrow-right" size={18} color="#fff" />}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Login link */}
          <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.loginRow}>
            <Text style={[styles.loginText, { color: colors.mutedForeground }]}>Already have an account?{'  '}</Text>
            <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
              <Text style={styles.loginLink}>Sign in</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05050A' },
  orbTop: {
    position: 'absolute', width: 300, height: 300, borderRadius: 999,
    backgroundColor: '#8B5CF612', top: -80, left: -70,
  },
  orbBottom: {
    position: 'absolute', width: 240, height: 240, borderRadius: 999,
    backgroundColor: '#EC489910', bottom: 40, right: -80,
  },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 28 },
  backCircle: {
    width: 44, height: 44, borderRadius: 14, borderWidth: 1,
    borderColor: '#ffffff18', backgroundColor: '#ffffff0D',
    alignItems: 'center', justifyContent: 'center',
  },
  header: { marginBottom: 28 },
  logoBox: {
    width: 56, height: 56, borderRadius: 18, alignItems: 'center',
    justifyContent: 'center', marginBottom: 22,
    shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },
  title: { fontSize: 34, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: -0.8, marginBottom: 8 },
  subtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EF444415', borderColor: '#EF444433', borderWidth: 1,
    borderRadius: 12, padding: 14, marginBottom: 18,
  },
  errorText: { flex: 1, color: '#EF4444', fontSize: 13, fontFamily: 'Inter_400Regular' },
  label: {
    fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6,
    textTransform: 'uppercase', marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderColor: '#ffffff20', borderRadius: 16, paddingHorizontal: 16,
    paddingVertical: 16, marginBottom: 16, minHeight: 56,
    backgroundColor: '#ffffff0A',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, fontFamily: 'Inter_400Regular', color: '#fff', paddingVertical: 0 },
  eyeBtn: { padding: 4 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 18 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthText: { fontSize: 11, fontFamily: 'Inter_500Medium', marginLeft: 4, minWidth: 50 },
  terms: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 24 },
  createWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 28 },
  createBtn: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  createText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_700Bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  loginText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  loginLink: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#8B5CF6' },
});
