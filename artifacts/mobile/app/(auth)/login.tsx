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

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const topPad = insets.top + 12;
  const botPad = insets.bottom + 32;

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/');
    } catch {
      setError('Invalid email or password. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setLoading(false);
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#08081A', '#0D0D22', '#05050A']} style={StyleSheet.absoluteFill} />
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
          <Pressable onPress={() => router.replace('/(auth)/welcome')} hitSlop={16} style={styles.backBtn}>
            <View style={styles.backCircle}>
              <Feather name="arrow-left" size={18} color="#fff" />
            </View>
          </Pressable>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="terminal" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Sign in to your workspace</Text>
          </Animated.View>

          {/* Error banner */}
          {!!error && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* Social buttons */}
          <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.socialRow}>
            <Pressable onPress={() => {}} style={styles.socialBtn}>
              <Feather name="github" size={18} color="#fff" />
              <Text style={styles.socialLabel}>GitHub</Text>
            </Pressable>
            <Pressable onPress={() => {}} style={styles.socialBtn}>
              <Feather name="globe" size={18} color="#fff" />
              <Text style={styles.socialLabel}>Google</Text>
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={[styles.divText, { color: colors.mutedForeground }]}>or continue with email</Text>
            <View style={styles.divLine} />
          </Animated.View>

          {/* Email */}
          <Animated.View entering={FadeInDown.delay(160).duration(500)}>
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
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={styles.inputRow}>
              <Feather name="lock" size={16} color="#ffffff55" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#ffffff33"
                secureTextEntry={!showPw}
                autoComplete="password"
                returnKeyType="done"
                textContentType="password"
                onSubmitEditing={handleLogin}
              />
              <Pressable onPress={() => setShowPw(v => !v)} hitSlop={12} style={styles.eyeBtn}>
                <Feather name={showPw ? 'eye-off' : 'eye'} size={16} color="#ffffff55" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Forgot password */}
          <Animated.View entering={FadeInDown.delay(230).duration(500)} style={styles.forgotRow}>
            <Pressable onPress={() => {}} hitSlop={8}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </Animated.View>

          {/* Sign In button */}
          <Animated.View entering={FadeInDown.delay(260).duration(500)}>
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [styles.signInWrap, { opacity: pressed || loading ? 0.8 : 1 }]}
            >
              <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.signInBtn}>
                <Text style={styles.signInText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
                {!loading && <Feather name="arrow-right" size={18} color="#fff" />}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Register link */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.registerRow}>
            <Text style={[styles.registerText, { color: colors.mutedForeground }]}>No account yet?{'  '}</Text>
            <Pressable onPress={() => router.replace('/(auth)/register')} hitSlop={8}>
              <Text style={styles.registerLink}>Create one</Text>
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
    position: 'absolute', width: 320, height: 320, borderRadius: 999,
    backgroundColor: '#6366F112', top: -100, right: -80,
  },
  orbBottom: {
    position: 'absolute', width: 260, height: 260, borderRadius: 999,
    backgroundColor: '#8B5CF60E', bottom: 60, left: -100,
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
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 },
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
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderWidth: 1, borderColor: '#ffffff18', borderRadius: 14,
    paddingVertical: 15, backgroundColor: '#ffffff0D',
  },
  socialLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  divLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#ffffff18' },
  divText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
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
  forgotRow: { alignItems: 'flex-end', marginBottom: 28, marginTop: -4 },
  forgotText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#6366F1' },
  signInWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 28 },
  signInBtn: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  signInText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_700Bold' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  registerText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  registerLink: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#6366F1' },
});
