import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing } from '../theme/theme';

export default function AuthWelcomeScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={[Colors.b0, Colors.b1]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        {/* Decorative rings */}
        <View style={[styles.ring, { width: 300, height: 300, borderRadius: 150, top: -60, right: -80 }]} />
        <View style={[styles.ring, { width: 200, height: 200, borderRadius: 100, top: 20, right: -30, borderColor: Colors.w04 }]} />

        <View style={styles.header}>
          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Zyphora Network</Text>
          </View>
          <Text style={styles.title}>Mine smarter.{'\n'}Participate better.</Text>
          <Text style={styles.subtitle}>
            Join the decentralized mining revolution. Verify your identity, secure your device, and start earning.
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { lbl: 'Active Miners', val: '2.4M' },
            { lbl: 'ZYP Distributed', val: '840M' },
            { lbl: 'Avg. Daily', val: '+284 pts' },
          ].map((s) => (
            <View key={s.lbl} style={styles.statItem}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.btnPrimary} onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.btnPrimaryText}>Sign In</Text>
          </Pressable>
          <Pressable style={styles.btnSecondary} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.btnSecondaryText}>Create Account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'space-between', overflow: 'hidden' },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  header: { marginTop: 60 },
  badge: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
  },
  badgeText: { color: '#A78BFA', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 40, fontWeight: '800', color: Colors.w, lineHeight: 48, marginBottom: Spacing.md },
  subtitle: { fontSize: 14, fontWeight: '400', color: Colors.textMuted, lineHeight: 22 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.b2,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 18, fontWeight: '800', color: Colors.w },
  statLbl: { fontSize: 10, color: Colors.textMuted, letterSpacing: 0.3, textAlign: 'center' },
  footer: { marginBottom: 20, gap: 10 },
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