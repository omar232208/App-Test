import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'a',
    icon: 'terminal' as const,
    title: 'Your Developer OS',
    subtitle: 'A unified command center for everything you build — projects, tasks, code, and team.',
    accent1: '#6366F1',
    accent2: '#8B5CF6',
    orb1: '#6366F122',
    orb2: '#8B5CF615',
  },
  {
    id: 'b',
    icon: 'cpu' as const,
    title: 'AI-Powered Dev',
    subtitle: 'Your intelligent coding partner — explains, generates, fixes bugs, and thinks with you.',
    accent1: '#8B5CF6',
    accent2: '#EC4899',
    orb1: '#8B5CF622',
    orb2: '#EC489915',
  },
  {
    id: 'c',
    icon: 'layers' as const,
    title: 'Build Without Limits',
    subtitle: 'Manage projects, track goals, collaborate with your team, and ship faster than ever.',
    accent1: '#3B82F6',
    accent2: '#6366F1',
    orb1: '#3B82F622',
    orb2: '#6366F115',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const btnScale = useSharedValue(1);

  const slide = SLIDES[activeIndex];
  const topPad = Platform.OS === 'web' ? 56 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.min(Math.max(idx, 0), SLIDES.length - 1));
  }

  function goNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  }

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#05050A', '#0D0D20']} style={StyleSheet.absoluteFill} />
      <View style={[styles.orb1, { backgroundColor: slide.orb1 }]} />
      <View style={[styles.orb2, { backgroundColor: slide.orb2 }]} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <View style={styles.logoRow}>
          <LinearGradient
            colors={[slide.accent1, slide.accent2]}
            style={styles.logoMark}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="terminal" size={13} color="#fff" />
          </LinearGradient>
          <Text style={styles.logoText}>DevOS</Text>
        </View>
        <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Swipeable slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
        style={{ flex: 1 }}
      >
        {SLIDES.map(s => (
          <View key={s.id} style={[styles.slide, { width }]}>
            {/* Icon */}
            <View style={styles.iconArea}>
              <View style={[styles.ringOuter, { borderColor: s.accent1 + '22' }]} />
              <View style={[styles.ringInner, { borderColor: s.accent1 + '33' }]} />
              <LinearGradient
                colors={[s.accent1, s.accent2]}
                style={styles.iconBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name={s.icon} size={54} color="#fff" />
              </LinearGradient>
            </View>

            {/* Text */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.textBlock}>
              <Text style={styles.slideTitle}>{s.title}</Text>
              <Text style={styles.slideSubtitle}>{s.subtitle}</Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={[styles.bottom, { paddingBottom: botPad + 24 }]}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <Pressable
              key={s.id}
              hitSlop={8}
              onPress={() => {
                setActiveIndex(i);
                scrollRef.current?.scrollTo({ x: i * width, animated: true });
              }}
            >
              <View
                style={[
                  styles.dot,
                  {
                    width: i === activeIndex ? 28 : 8,
                    backgroundColor:
                      i === activeIndex ? slide.accent1 : '#ffffff25',
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>

        {/* CTA */}
        <AnimatedPressable
          style={[btnStyle, styles.ctaWrap]}
          onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
          onPressOut={() => { btnScale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
          onPress={goNext}
        >
          <LinearGradient
            colors={[slide.accent1, slide.accent2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>
              {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Feather
              name={activeIndex === SLIDES.length - 1 ? 'arrow-right' : 'chevron-right'}
              size={20}
              color="#fff"
            />
          </LinearGradient>
        </AnimatedPressable>

        <Pressable
          onPress={() => router.replace('/(auth)/register')}
          hitSlop={8}
          style={styles.altRow}
        >
          <Text style={styles.altText}>New here?{'  '}</Text>
          <Text style={[styles.altLink, { color: slide.accent1 }]}>Create an account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb1: {
    position: 'absolute', width: 340, height: 340,
    borderRadius: 999, top: -100, right: -90,
  },
  orb2: {
    position: 'absolute', width: 280, height: 280,
    borderRadius: 999, bottom: 80, left: -110,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 8,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_700Bold' },
  skipText: { color: '#ffffff44', fontSize: 14, fontFamily: 'Inter_500Medium' },
  slide: { alignItems: 'center', paddingHorizontal: 32 },
  iconArea: {
    alignItems: 'center', justifyContent: 'center',
    marginTop: 32, marginBottom: 8,
  },
  ringOuter: {
    position: 'absolute', width: 220, height: 220,
    borderRadius: 999, borderWidth: 1,
  },
  ringInner: {
    position: 'absolute', width: 174, height: 174,
    borderRadius: 999, borderWidth: 1,
  },
  iconBox: {
    width: 132, height: 132, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.55, shadowRadius: 30, elevation: 16,
  },
  textBlock: { alignItems: 'center', marginTop: 52 },
  slideTitle: {
    fontSize: 34, fontFamily: 'Inter_700Bold', color: '#fff',
    textAlign: 'center', letterSpacing: -0.8, marginBottom: 18,
  },
  slideSubtitle: {
    fontSize: 16, fontFamily: 'Inter_400Regular', color: '#ffffff66',
    textAlign: 'center', lineHeight: 26,
  },
  bottom: { paddingHorizontal: 24 },
  dots: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 6, marginBottom: 22,
  },
  dot: { height: 8, borderRadius: 4 },
  ctaWrap: { borderRadius: 18, overflow: 'hidden', marginBottom: 20 },
  ctaBtn: {
    height: 58, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ctaText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_700Bold' },
  altRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  altText: { color: '#ffffff44', fontSize: 14, fontFamily: 'Inter_400Regular' },
  altLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
