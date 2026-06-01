import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { CatchupBanner } from '../components/domain/CatchupBanner';
import api from '../redux/api';
import { setScore } from '../redux/slices/scoreSlice';
import { setStreak } from '../redux/slices/streakSlice';
import { Colors, Spacing } from '../theme/theme';

const MAX_ADS_PER_DAY = 3;
const AD_DURATION = 10; // seconds
const AD_REWARD_PTS = 30;

// ─── Watch Ad Modal ───────────────────────────────────────────────────────────
function WatchAdModal({ visible, onClose, onReward }) {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [phase, setPhase] = useState('watching'); // watching | rewarded
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      setCountdown(AD_DURATION);
      setPhase('watching');
      progressAnim.setValue(0);
      return;
    }

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: AD_DURATION * 1000,
      useNativeDriver: false,
    }).start();

    // Countdown timer
    setCountdown(AD_DURATION);
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current);
          setPhase('rewarded');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [visible]);

  const handleClaim = () => {
    onReward(AD_REWARD_PTS);
    onClose();
  };

  // Fake ad content — replace with real ad SDK call in production
  const AD_CONTENT = [
    { emoji: '🎮', title: 'Level up your game', sub: 'Download now — free to play' },
    { emoji: '💎', title: 'Premium membership', sub: 'Unlock exclusive rewards today' },
    { emoji: '🚀', title: 'Launch faster', sub: 'The productivity app everyone uses' },
  ];
  const ad = AD_CONTENT[Math.floor(Math.random() * AD_CONTENT.length)];

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={adStyles.overlay}>
        <View style={adStyles.sheet}>
          {/* Header */}
          <View style={adStyles.header}>
            <Text style={adStyles.headerLabel}>ADVERTISEMENT</Text>
            {phase === 'watching' ? (
              <View style={adStyles.skipTag}>
                <Text style={adStyles.skipTagText}>Skip in {countdown}s</Text>
              </View>
            ) : null}
          </View>

          {/* Progress bar */}
          <View style={adStyles.progressTrack}>
            <Animated.View
              style={[
                adStyles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {phase === 'watching' ? (
            // Ad content
            <View style={adStyles.adContent}>
              <View style={adStyles.adBanner}>
                <Text style={adStyles.adEmoji}>{ad.emoji}</Text>
                <Text style={adStyles.adTitle}>{ad.title}</Text>
                <Text style={adStyles.adSub}>{ad.sub}</Text>
                <View style={adStyles.adBtn}>
                  <Text style={adStyles.adBtnText}>Learn More</Text>
                </View>
              </View>

              {/* Reward preview */}
              <View style={adStyles.rewardPreview}>
                <Text style={adStyles.rewardPreviewIcon}>🎁</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={adStyles.rewardPreviewTitle}>Your reward</Text>
                  <Text style={adStyles.rewardPreviewSub}>
                    +{AD_REWARD_PTS} pts — watch the full ad to claim
                  </Text>
                </View>
                <Text style={adStyles.countdownBig}>{countdown}</Text>
              </View>
            </View>
          ) : (
            // Reward claimed state
            <View style={adStyles.rewardedState}>
              <Text style={adStyles.rewardedEmoji}>🎉</Text>
              <Text style={adStyles.rewardedTitle}>Ad complete!</Text>
              <Text style={adStyles.rewardedSub}>You earned</Text>
              <Text style={adStyles.rewardedPts}>+{AD_REWARD_PTS} pts</Text>
              <Pressable style={adStyles.claimBtn} onPress={handleClaim}>
                <Text style={adStyles.claimBtnText}>Claim Reward</Text>
              </Pressable>
            </View>
          )}

          {/* Close — only available after ad finishes */}
          {phase === 'rewarded' ? null : (
            <Pressable style={adStyles.closeBtn} onPress={onClose}>
              <Text style={adStyles.closeBtnText}>✕  Close (lose reward)</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const dispatch = useDispatch();
  const displayName = useSelector((s) => s.auth.displayName);
  const score = useSelector((s) => s.score.snapshot);
  const streakData = useSelector((s) => s.streak.data);

  const [refreshing, setRefreshing] = useState(false);
  const [miningBusy, setMiningBusy] = useState(false);
  const [adVisible, setAdVisible] = useState(false);
  const [adsWatched, setAdsWatched] = useState(0);
  const [adPtsEarned, setAdPtsEarned] = useState(0);

  const ringPulse = useRef(new Animated.Value(1)).current;

  const load = async () => {
    try {
      const { data } = await api.get('/score');
      dispatch(setScore(data.score));
    } catch { /* offline */ }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1.04, duration: 1800, useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const doCheckin = async () => {
    setMiningBusy(true);
    try {
      const { data } = await api.post('/mine/checkin');
      if (data.streak) dispatch(setStreak(data.streak));
      await load();
    } catch { /* offline */ }
    finally { setMiningBusy(false); }
  };

  const handleAdReward = (pts) => {
    setAdsWatched((n) => n + 1);
    setAdPtsEarned((n) => n + pts);
    // In production: call your backend to credit the points
    // api.post('/mine/ad-reward', { points: pts });
  };

  const adsLeft = MAX_ADS_PER_DAY - adsWatched;

  const ps = Number(score?.ps_total ?? 0);
  const momentum = Number(score?.momentum_m ?? 0);
  const streak = streakData?.current_streak ?? 0;
  const todayPts = 130 + adPtsEarned;

  const initials = displayName
    ? displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ZY';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
            tintColor={Colors.w30}
          />
        }
      >
        {/* Identity strip */}
        <View style={styles.identityRow}>
          <View style={styles.identityLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ gap: 2 }}>
              <Text style={styles.identityName}>{displayName || 'Miner'}</Text>
              <View style={styles.identityTags}>
                <Text style={styles.identityTag}>Day 0 Founder</Text>
                <Text style={styles.identityDot}>·</Text>
                <Text style={styles.identityTag}>Pioneer</Text>
              </View>
            </View>
          </View>
          <View style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
          </View>
        </View>

        {/* Token balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>TOTAL ZYP TOKENS</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>{Math.max(0, Math.round(ps * 12847)).toLocaleString()}</Text>
            <View style={styles.dailyTag}>
              <Text style={styles.dailyTagText}>+{todayPts} today</Text>
            </View>
          </View>
          <Text style={styles.balanceSub}>≈ {Math.round(ps * 3847)} ZYP at launch · 85.6% to Founder</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '85.6%' }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLbl}>{Math.round(ps * 12847).toLocaleString()}</Text>
            <Text style={styles.progressLbl}>15,000 → Founder</Text>
          </View>
        </View>

        {/* Metrics row */}
        <View style={styles.metricsRow}>
          {[
            { lbl: 'Streak', val: `${streak}d`, sub: streak > 0 ? '🔥 Active' : 'Start today' },
            { lbl: 'Momentum', val: `${(1 + momentum).toFixed(2)}×`, sub: 'Multiplier' },
            { lbl: 'Ads today', val: `${adsWatched}/${MAX_ADS_PER_DAY}`, sub: `+${adPtsEarned} pts` },
          ].map((m) => (
            <View key={m.lbl} style={styles.metricCard}>
              <Text style={styles.metricLbl}>{m.lbl.toUpperCase()}</Text>
              <Text style={styles.metricVal}>{m.val}</Text>
              <Text style={styles.metricSub}>{m.sub}</Text>
            </View>
          ))}
        </View>

        {/* Mining ring */}
        <View style={styles.miningSection}>
          <Pressable onPress={doCheckin} disabled={miningBusy}>
            <Animated.View style={[styles.ringOuter, { transform: [{ scale: ringPulse }] }]}>
              <View style={styles.ringMiddle}>
                <View style={styles.ringInner}>
                  <Text style={styles.ringTopLabel}>TODAY</Text>
                  <Text style={styles.ringValue}>+{todayPts}</Text>
                  <Text style={styles.ringSubLabel}>points</Text>
                </View>
              </View>
            </Animated.View>
          </Pressable>
          <View style={styles.tapTag}>
            <Text style={styles.tapTagText}>{miningBusy ? '⛏  MINING…' : '⛏  TAP TO MINE'}</Text>
          </View>
        </View>

        {/* Daily reward + Watch Ad row */}
        <View style={styles.rewardRow}>
          {/* Daily reward */}
          <View style={styles.rewardCard}>
            <Text style={styles.rewardLbl}>DAILY REWARD</Text>
            <Text style={styles.rewardVal}>+130 pts</Text>
            <Text style={styles.rewardSub}>Rate: {(1 + momentum).toFixed(2)}× · Day {streak}</Text>
          </View>

          {/* Watch Ad */}
          <Pressable
            style={[styles.rewardCard, styles.adCard, adsLeft === 0 && styles.adCardDone]}
            onPress={() => adsLeft > 0 && setAdVisible(true)}
            disabled={adsLeft === 0}
          >
            <Text style={styles.rewardLbl}>WATCH AD</Text>
            <Text style={[styles.rewardVal, adsLeft === 0 && styles.rewardValDone]}>
              +{AD_REWARD_PTS} pts
            </Text>
            {adsLeft > 0 ? (
              <View style={styles.adLeftRow}>
                <Text style={styles.adPlayIcon}>▶</Text>
                <Text style={styles.adLeftText}>{adsLeft} left today</Text>
              </View>
            ) : (
              <Text style={styles.adDoneText}>✓ All watched</Text>
            )}
          </Pressable>
        </View>

        {/* Catchup banner */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <CatchupBanner />
        </View>

        {/* Boosts list */}
        <Text style={styles.sectionTitle}>TODAY'S BOOSTS</Text>
        {[
          { lbl: `Streak bonus (day ${streak})`, val: '+142%', active: streak > 0 },
          { lbl: `Ads watched (${adsWatched}/${MAX_ADS_PER_DAY})`, val: `+${adsWatched * 10}%`, active: adsWatched > 0 },
          { lbl: 'Quiz done', val: '+12%', active: false },
          { lbl: 'KYC verified', val: '×1.0D', active: true },
          { lbl: 'Premium task', val: '+0%', active: false },
        ].map((b) => (
          <View key={b.lbl} style={styles.boostRow}>
            <Text style={[styles.boostLbl, !b.active && styles.boostDim]}>{b.lbl}</Text>
            <Text style={[styles.boostVal, !b.active && styles.boostDim]}>{b.val}</Text>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Watch Ad Modal */}
      <WatchAdModal
        visible={adVisible}
        onClose={() => setAdVisible(false)}
        onReward={handleAdReward}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.b0 },
  scroll: { paddingBottom: 20 },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  identityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.b3, borderWidth: 1, borderColor: Colors.line2,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.w },
  identityName: { fontSize: 16, fontWeight: '700', color: Colors.w },
  identityTags: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  identityTag: { fontSize: 10, color: Colors.textMuted },
  identityDot: { fontSize: 10, color: Colors.textDim },
  notifBtn: {
    width: 36, height: 36, backgroundColor: Colors.b2,
    borderWidth: 1, borderColor: Colors.line, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 17 },

  balanceCard: {
    marginHorizontal: Spacing.lg, marginBottom: 12,
    backgroundColor: Colors.b2, borderWidth: 1, borderColor: Colors.line2,
    borderRadius: 16, padding: 16,
  },
  balanceLabel: { fontSize: 10, fontWeight: '500', color: Colors.textDim, letterSpacing: 4, marginBottom: 6 },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 4 },
  balanceValue: { fontSize: 40, fontWeight: '800', color: Colors.w, lineHeight: 46 },
  dailyTag: {
    backgroundColor: 'rgba(52,211,153,0.15)', borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)', borderRadius: 9999,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8,
  },
  dailyTagText: { fontSize: 10, fontWeight: '600', color: Colors.up },
  balanceSub: { fontSize: 11, color: Colors.textDim, marginBottom: 12 },
  progressTrack: { height: 4, backgroundColor: Colors.w04, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: Colors.w, borderRadius: 2 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  progressLbl: { fontSize: 10, color: Colors.textDim },

  metricsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, marginBottom: 12 },
  metricCard: {
    flex: 1, backgroundColor: Colors.b2, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 12, padding: 11, gap: 2,
  },
  metricLbl: { fontSize: 8, fontWeight: '600', color: Colors.textDim, letterSpacing: 2 },
  metricVal: { fontSize: 17, fontWeight: '700', color: Colors.w },
  metricSub: { fontSize: 10, color: Colors.textMuted },

  miningSection: { alignItems: 'center', paddingVertical: 8, marginBottom: 12 },
  ringOuter: {
    width: 172, height: 172, borderRadius: 86,
    borderWidth: 2, borderColor: Colors.line2,
    backgroundColor: Colors.b1,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.w, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06, shadowRadius: 20, elevation: 6,
  },
  ringMiddle: {
    width: 148, height: 148, borderRadius: 74,
    borderWidth: 10, borderColor: Colors.w08,
    alignItems: 'center', justifyContent: 'center',
  },
  ringInner: { alignItems: 'center', gap: 2 },
  ringTopLabel: { fontSize: 9, fontWeight: '600', color: Colors.textDim, letterSpacing: 4 },
  ringValue: { fontSize: 30, fontWeight: '800', color: Colors.w, lineHeight: 34 },
  ringSubLabel: { fontSize: 11, color: Colors.textMuted },
  tapTag: {
    marginTop: 12, backgroundColor: Colors.w04, borderWidth: 1,
    borderColor: Colors.line2, borderRadius: 9999,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  tapTagText: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 2 },

  rewardRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, marginBottom: 12 },
  rewardCard: {
    flex: 1, backgroundColor: Colors.b2, borderWidth: 1,
    borderColor: Colors.line, borderRadius: 12, padding: 12, gap: 3,
  },
  adCard: { borderColor: Colors.line2 },
  adCardDone: { opacity: 0.5 },
  rewardLbl: { fontSize: 8, fontWeight: '600', color: Colors.textDim, letterSpacing: 2 },
  rewardVal: { fontSize: 18, fontWeight: '800', color: Colors.w },
  rewardValDone: { color: Colors.textMuted },
  rewardSub: { fontSize: 10, color: Colors.textMuted },
  adLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  adPlayIcon: { fontSize: 10, color: Colors.up },
  adLeftText: { fontSize: 10, color: Colors.up, fontWeight: '600' },
  adDoneText: { fontSize: 10, color: Colors.textMuted },

  sectionTitle: {
    fontSize: 9, fontWeight: '600', color: Colors.textDim,
    letterSpacing: 4, paddingHorizontal: Spacing.lg,
    marginBottom: 8, marginTop: 4,
  },
  boostRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  boostLbl: { fontSize: 13, color: Colors.textLight },
  boostVal: { fontSize: 13, fontWeight: '700', color: Colors.w },
  boostDim: { color: Colors.textDim },
});

// ─── Ad modal styles ──────────────────────────────────────────────────────────
const adStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.b1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: Colors.line2,
    paddingBottom: 36,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLabel: { fontSize: 10, fontWeight: '700', color: Colors.textDim, letterSpacing: 3 },
  skipTag: {
    backgroundColor: Colors.w04, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4,
  },
  skipTagText: { fontSize: 11, color: Colors.textMuted },

  progressTrack: { height: 3, backgroundColor: Colors.w04, marginHorizontal: 20 },
  progressFill: { height: 3, backgroundColor: Colors.up },

  adContent: { padding: 20, gap: 14 },
  adBanner: {
    backgroundColor: Colors.b3, borderWidth: 1, borderColor: Colors.line2,
    borderRadius: 16, padding: 20, alignItems: 'center', gap: 8,
  },
  adEmoji: { fontSize: 40 },
  adTitle: { fontSize: 18, fontWeight: '700', color: Colors.w, textAlign: 'center' },
  adSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  adBtn: {
    marginTop: 4, backgroundColor: Colors.w, borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  adBtnText: { fontSize: 13, fontWeight: '700', color: '#000' },

  rewardPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.b2, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 14, padding: 14,
  },
  rewardPreviewIcon: { fontSize: 24 },
  rewardPreviewTitle: { fontSize: 13, fontWeight: '600', color: Colors.w },
  rewardPreviewSub: { fontSize: 11, color: Colors.textMuted },
  countdownBig: { fontSize: 28, fontWeight: '800', color: Colors.w, minWidth: 36, textAlign: 'center' },

  rewardedState: {
    padding: 32, alignItems: 'center', gap: 8,
  },
  rewardedEmoji: { fontSize: 52 },
  rewardedTitle: { fontSize: 22, fontWeight: '800', color: Colors.w },
  rewardedSub: { fontSize: 14, color: Colors.textMuted },
  rewardedPts: { fontSize: 36, fontWeight: '800', color: Colors.up },
  claimBtn: {
    marginTop: 12, backgroundColor: Colors.w, borderRadius: 12,
    paddingHorizontal: 40, paddingVertical: 14, width: '100%', alignItems: 'center',
  },
  claimBtnText: { fontSize: 15, fontWeight: '700', color: '#000', letterSpacing: 0.3 },

  closeBtn: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  closeBtnText: { fontSize: 12, color: Colors.textDim },
});