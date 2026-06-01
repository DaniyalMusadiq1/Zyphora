import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import ZyInput from '../components/common/ZyInput';
import api from '../redux/api';
import { setCredentials, setDeviceId } from '../redux/slices/authSlice';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { Colors, Spacing } from '../theme/theme';
import { showToast } from '../utils/toast';

// Embedded Zero-Dependency Vector Elements matching your design language
const UIVector = {
  ChevronLeft: ({ color }) => (
    <View style={{ width: 10, height: 10, borderColor: color, borderLeftWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '45deg' }], marginLeft: 3 }} />
  ),
  Key: ({ color }) => (
    <View style={{ width: 13, height: 13, borderColor: color, borderTopWidth: 2, borderRightWidth: 2, transform: [{ rotate: '45deg' }] }}>
      <View style={{ width: 6, height: 2, backgroundColor: color, position: 'absolute', bottom: -1, left: -2, transform: [{ rotate: '-45deg' }] }} />
    </View>
  ),
  Mail: ({ color }) => (
    <View style={{ width: 18, height: 13, borderRadius: 2, borderWidth: 1.5, borderColor: color, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 10, height: 10, borderLeftWidth: 1.5, borderTopWidth: 1.5, borderColor: color, transform: [{ rotate: '135deg' }], marginTop: -5 }} />
    </View>
  ),
  Lock: ({ color }) => (
    <View style={{ width: 14, height: 11, borderRadius: 2, borderWidth: 1.5, borderColor: color, alignItems: 'center', marginTop: 6 }}>
      <View style={{ width: 10, height: 8, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderWidth: 1.5, borderColor: color, borderBottomWidth: 0, position: 'absolute', top: -7 }} />
    </View>
  )
};

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <View style={eb.wrap}>
      <View style={eb.iconWrap}>
        <Text style={eb.icon}>!</Text>
      </View>
      <Text style={eb.text}>{message}</Text>
    </View>
  );
}

const eb = StyleSheet.create({
  wrap: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    backgroundColor: 'rgba(248,113,113,0.06)',
    borderLeftWidth: 3, 
    borderLeftColor: Colors.error || '#EF4444',
    borderRightWidth: 1, 
    borderTopWidth: 1, 
    borderBottomWidth: 1,
    borderRightColor: 'rgba(248,113,113,0.15)',
    borderTopColor: 'rgba(248,113,113,0.15)',
    borderBottomColor: 'rgba(248,113,113,0.15)',
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 12,
    marginBottom: 20,
  },
  iconWrap: {
    width: 20, 
    height: 20, 
    borderRadius: 10,
    backgroundColor: 'rgba(248,113,113,0.2)',
    alignItems: 'center', 
    justifyContent: 'center', 
    flexShrink: 0,
  },
  icon: { fontSize: 11, fontWeight: '800', color: Colors.error || '#EF4444' },
  text: { flex: 1, fontSize: 13, color: Colors.error || '#EF4444', lineHeight: 18, fontWeight: '500' },
});

/* ─── Premium Redesigned Primary Button ──────────────────────────── */
function PrimaryButton({ label, onPress, loading, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        pb.btn, 
        pressed && pb.pressed, 
        disabled && pb.disabled
      ]}
    >
      {loading ? (
        // Loading spinner set to dark to remain visible against the neon background
        <ActivityIndicator color="#FFFFF" size="small" />
      ) : (
        <View style={pb.contentLayout}>
          {/* Label text set to dark contrast for rich accessibility on dark screens */}
          <Text style={[pb.label, disabled && pb.disabledLabel]}>{label}</Text>
          <View style={pb.iconWrapper}>
            <UIVector.Key color={disabled ? 'rgba(255,255,255,0.3)' : '#FFFFF'} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const pb = StyleSheet.create({
  btn: {
    backgroundColor: '#00F2FE', 
    borderRadius: 14, 
    height: 52,
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 6,
    width: '100%',
  },
  pressed: { 
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: { 
    backgroundColor: 'rgba(255,255,255,0.12)',
    shadowOpacity: 0,
    elevation: 0,
  },
  contentLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#FFFFF', 
    letterSpacing: 0.2 
  },
  disabledLabel: {
    color: 'rgba(255,255,255,0.3)',
  },
  iconWrapper: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default function SignInScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Email and password are required');
      shake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const device_id = await getDeviceFingerprint();
      dispatch(setDeviceId(device_id));
      const { data } = await api.post('/auth/login-email', {
        email: email.trim().toLowerCase(),
        password,
        device_id,
      });
      dispatch(setCredentials({ token: data.token, userId: data.user_id, referralCode: data.referral_code }));
      showToast('Welcome back!', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid email or password';
      setError(msg);
      shake();
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={s.glowTop} />
        <View style={s.glowBottom} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          overScrollMode="never"
        >
          {/* Back Action Header */}
          <Pressable style={s.backBtn} onPress={() => navigation.goBack()}>
            <View style={s.backBox}>
              <UIVector.ChevronLeft color={Colors.w || '#FFFFFF'} />
            </View>
          </Pressable>

          {/* Core Content Area */}
          <View style={s.heading}>
            <View style={s.tagPill}>
              <View style={s.tagDot} />
              <Text style={s.tag}>SIGN IN</Text>
            </View>
            <Text style={s.title}>Welcome{'\n'}back</Text>
            <Text style={s.subtitle}>Continue your journey on Zyphora</Text>
          </View>

          {/* Form Card */}
          <Animated.View style={[s.card, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={s.cardEdge} pointerEvents="none" />
            <ErrorBanner message={error} />
            
            <ZyInput
              label="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<UIVector.Mail color="rgba(255,255,255,0.4)" />}
            />
            <ZyInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<UIVector.Lock color="rgba(255,255,255,0.4)" />}
            />
            
            <Pressable style={s.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </Pressable>

            <PrimaryButton
              label="Login"
              loading={loading}
              onPress={submit}
              disabled={loading || !email || !password}
            />
          </Animated.View>

          {/* Segment Divider */}
          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>OR</Text>
            <View style={s.divLine} />
          </View>

          {/* Bottom Context Row Footer */}
          <View style={s.bottomRow}>
            <Text style={s.bottomLabel}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('SignUp')} hitSlop={8}>
              <Text style={s.bottomLink}>Create profile</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.b0 || '#030712', overflow: 'hidden' },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg || 20,
    paddingBottom: Spacing.xl || 24,
    paddingTop: Spacing.sm || 12,
  },

  glowTop: {
    position: 'absolute', top: -30, right: -30,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(0, 242, 254, 0.025)',
  },
  glowBottom: {
    position: 'absolute', bottom: 40, left: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(99, 102, 241, 0.015)',
  },

  backBtn: { marginBottom: Spacing.lg || 20, marginTop: Spacing.sm || 12, alignSelf: 'flex-start' },
  backBox: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  heading: { marginBottom: 28 },
  tagPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    marginBottom: 14,
  },
  tagDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#00F2FE' },
  tag: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
  title: {
    fontSize: 38, fontWeight: '800', color: Colors.w || '#FFFFFF',
    letterSpacing: -1.5, lineHeight: 44, marginBottom: 8,
  },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 20 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22, padding: 20, marginBottom: 8,
    overflow: 'hidden',
  },
  cardEdge: {
    position: 'absolute', top: 0, left: 36, right: 36,
    height: 1, backgroundColor: 'rgba(255,255,255,0.1)',
  },

  forgotRow: { alignItems: 'flex-end', marginBottom: 20, marginTop: 4 },
  forgotText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  divText: { fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: '700', letterSpacing: 1 },

  bottomRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 'auto', paddingTop: 16,
  },
  bottomLabel: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  bottomLink: {
    fontSize: 13, fontWeight: '700', color: '#00F2FE',
  },
});