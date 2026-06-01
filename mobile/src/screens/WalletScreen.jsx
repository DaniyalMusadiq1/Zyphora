import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from '../components/SharedComponents'; // adjust path if needed

export default function WalletScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + 10;

  // KYC steps (mock data)
  const kycSteps = [
    { label: 'Mobile', done: true },
    { label: 'Identity', done: false },
    { label: 'Liveness', done: false },
  ];

  const completedCount = kycSteps.filter((s) => s.done).length;

  return (
    <View className="flex-1 bg-[#070B14]" style={{ paddingTop: topPadding }}>
      <StatusBar />

      <View className="flex-1 px-5 justify-between pb-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[24px] font-bold text-white tracking-tight">Wallet</Text>
          <View className="bg-white/[0.05] border border-white/[0.1] rounded-full px-3 py-1.5">
            <Text className="text-[10px] font-medium text-white/60">Phase III</Text>
          </View>
        </View>

        {/* Airdrop Card – No progress bar */}
        <View className="bg-[#111827] border border-white/[0.1] rounded-3xl p-5 mb-5 overflow-hidden">
          {/* Decorative blobs */}
          <View className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-500/10" />
          <View className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-purple-500/10" />

          <View className="flex-row items-center justify-between mb-3 z-10">
            <Text className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Airdrop</Text>
            <View className="flex-row items-center gap-1.5 bg-white/[0.05] border border-white/[0.1] rounded-full px-3 py-1">
              <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
                <Rect x="3" y="11" width="18" height="11" rx="2" />
                <Path d="M7 11V7a5 5 0 0110 0v4" />
              </Svg>
              <Text className="text-[10px] font-medium text-white/60">Locked</Text>
            </View>
          </View>

          {/* Token icon & Coming Soon text */}
          <View className="items-center my-4 z-10">
            <View className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] items-center justify-center mb-3">
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                <Circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" />
                <Path d="M12 6v12M8 12h8" stroke="white" />
              </Svg>
            </View>
            <Text className="text-[20px] font-bold text-white mb-1">Coming Soon</Text>
            <Text className="text-[12px] text-white/40 text-center max-w-[240px] leading-5">
              Your ZYP tokens will be airdropped at launch. Keep mining to increase your share.
            </Text>
          </View>
        </View>

        {/* KYC Verification – Redesigned */}
        <TouchableOpacity
          className="bg-[#111827] border border-white/[0.1] rounded-2xl p-4 mb-5"
          activeOpacity={0.8}
          onPress={() => navigation.navigate('KYC')}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">KYC Verification</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-[11px] font-semibold text-white/70">Manage</Text>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M9 18l6-6-6-6" />
              </Svg>
            </View>
          </View>

          {/* Step indicators – luxury dots with connecting line */}
          <View className="flex-row items-center justify-between mb-3">
            {kycSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                {/* Step circle */}
                <View className="items-center flex-1">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      step.done
                        ? 'bg-emerald-400'
                        : 'bg-white/[0.08] border border-white/[0.15]'
                    }`}
                  >
                    {step.done ? (
                      <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round">
                        <Path d="M20 6 9 17 4 12" />
                      </Svg>
                    ) : (
                      <Text className="text-[11px] font-bold text-white/50">{idx + 1}</Text>
                    )}
                  </View>
                  <Text
                    className={`text-[10px] mt-1 ${
                      step.done ? 'text-white/70' : 'text-white/30'
                    }`}
                  >
                    {step.label}
                  </Text>
                </View>

                {/* Connecting line between steps */}
                {idx < kycSteps.length - 1 && (
                  <View className="h-px flex-1 bg-white/[0.08]" style={{ marginBottom: 20 }} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Completion summary */}
          <View className="flex-row justify-between pt-3 border-t border-white/[0.08]">
            <Text className="text-[10px] text-white/40">Completion</Text>
            <Text className="text-[10px] text-white/60 font-medium">
              {completedCount} of {kycSteps.length} steps done
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </View>
    </View>
  );
}