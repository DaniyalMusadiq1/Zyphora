import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import ZyInput from '../components/common/ZyInput';
import ZyButton from '../components/common/ZyButton';
import api from '../redux/api';
import { Colors, Spacing } from '../theme/theme';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      // In a real app: await api.post('/auth/forgot-password', { email })
      // Simulating success for now
      await new Promise((r) => setTimeout(r, 900));
      setSent(true);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Back */}
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <View style={styles.backBox}>
              <Text style={styles.backArrow}>‹</Text>
            </View>
          </Pressable>

          {/* Icon */}
          <View style={styles.iconBox}>
            <Text style={styles.iconEmoji}>✉️</Text>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>

          <View style={{ marginTop: Spacing.lg }}>
            <ZyInput
              label="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
            />
            <ZyButton
              label="Send Reset Link"
              loading={loading}
              onPress={submit}
              size="lg"
              style={{ marginTop: 4 }}
            />
          </View>

          {/* Confirmation card */}
          {sent ? (
            <View style={styles.confirmCard}>
              <Text style={styles.confirmIcon}>✅</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.confirmTitle}>Check your inbox</Text>
                <Text style={styles.confirmSub}>Reset link sent to {email}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.bottomRow}>
            <Text style={styles.bottomLabel}>Remembered it? </Text>
            <Pressable onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.bottomLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.b0 },
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  backBtn: { marginBottom: Spacing.lg, marginTop: Spacing.sm },
  backBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.w04,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: Colors.w70, lineHeight: 24 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.b2,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  iconEmoji: { fontSize: 26 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.w, marginBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.textMuted, lineHeight: 21 },
  confirmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.b2,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    padding: 14,
    marginTop: Spacing.lg,
  },
  confirmIcon: { fontSize: 18 },
  confirmTitle: { fontSize: 12, fontWeight: '600', color: Colors.w },
  confirmSub: { fontSize: 11, color: Colors.textMuted },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  bottomLabel: { fontSize: 12, color: Colors.textDim },
  bottomLink: { fontSize: 12, fontWeight: '600', color: Colors.textLight },
});