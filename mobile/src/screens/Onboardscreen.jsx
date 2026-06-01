import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../theme/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    icon: '⚡',
    title: 'Mine with your\ndaily presence',
    sub: 'No hardware. No capital. Verified participation earns ZYP tokens every single day.',
  },
  {
    key: '2',
    icon: '🔗',
    title: 'Build your\nnetwork',
    sub: 'Refer friends and grow your referral graph. Each connection boosts your score quality.',
  },
  {
    key: '3',
    icon: '🏆',
    title: 'Rise through\nthe ranks',
    sub: 'Complete tasks, maintain streaks, and unlock KYC tiers to earn your place at the top.',
  },
];

export default function OnboardScreen({ onFinish }) {
  const [active, setActive] = useState(0);
  const flatRef = useRef(null);

  const goNext = () => {
    if (active < SLIDES.length - 1) {
      const next = active + 1;
      flatRef.current?.scrollToIndex({ index: next });
      setActive(next);
    } else {
      onFinish?.();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Step counter + skip */}
      <View style={styles.topRow}>
        <Text style={styles.stepText}>
          {String(active + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </Text>
        <Pressable onPress={() => onFinish?.()}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActive(idx);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.sub}</Text>
          </View>
        )}
        style={{ flex: 1 }}
      />

      {/* Capsule dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={String(i)}
            style={[styles.dot, i === active ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      {/* CTA buttons */}
      <View style={styles.footer}>
        <Pressable style={styles.btnPrimary} onPress={goNext}>
          <Text style={styles.btnPrimaryText}>
            {active === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </Pressable>
        <Pressable style={styles.btnSecondary} onPress={() => onFinish?.()}>
          <Text style={styles.btnSecondaryText}>I already have an account</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.b0 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stepText: { fontSize: 11, fontWeight: '600', color: Colors.textDim, letterSpacing: 2 },
  skipText: { fontSize: 12, color: Colors.textMuted },
  slide: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  iconBox: {
    width: 140,
    height: 140,
    borderRadius: 40,
    backgroundColor: Colors.b2,
    borderWidth: 1,
    borderColor: Colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 56 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.w, lineHeight: 36, textAlign: 'center' },
  sub: { fontSize: 14, color: Colors.textMuted, lineHeight: 22, textAlign: 'center', maxWidth: 280 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginVertical: Spacing.lg },
  dot: { height: 3, borderRadius: 2 },
  dotActive: { width: 22, backgroundColor: Colors.w },
  dotInactive: { width: 7, backgroundColor: Colors.w15 },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: 10 },
  btnPrimary: {
    height: 50,
    backgroundColor: Colors.w,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: { fontSize: 14, fontWeight: '700', color: '#000', letterSpacing: 0.3 },
  btnSecondary: {
    height: 50,
    backgroundColor: Colors.w04,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: { fontSize: 14, fontWeight: '500', color: Colors.textLight },
});