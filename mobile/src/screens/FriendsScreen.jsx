import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { AreaChart, StatusBar, BottomNav } from "../components/SharedComponents";

export default function FriendsScreen({ setScreen }) {
  const metrics = [
    { l: "Total Friends", v: "14", s: "Active" },
    { l: "Earned", v: "+1,243", s: "From referrals" },
    { l: "Network Q", v: "0.76", s: "Quality rating" },
  ];
  const friends = [
    { n: "Sara K.", d: 14, q: "0.84", kyc: true, pts: "+142", act: true },
    { n: "Priya D.", d: 22, q: "0.91", kyc: true, pts: "+198", act: true },
    { n: "James O.", d: 9, q: "0.61", kyc: true, pts: "+88", act: true },
    { n: "Anon User", d: 3, q: "0.12", kyc: false, pts: "+0", act: false },
    { n: "Chen W.", d: 31, q: "0.78", kyc: true, pts: "+156", act: true },
  ];

  return (
    <View className="flex-1 bg-[#070B14]">
      <StatusBar />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="px-5 pt-1 mb-3.5">
          <Text className="text-[22px] font-bold text-white">Friends</Text>
        </View>

        {/* Stats */}
        <View className="px-5 flex-row gap-2 mb-3.5">
          {metrics.map((m) => (
            <View key={m.l} className="flex-1 bg-[#111827] border border-white/[0.08] rounded-xl p-2.5">
              <Text className="text-[10px] font-medium text-white/30 tracking-[0.06em] uppercase mb-0.5">{m.l}</Text>
              <Text className={`font-bold text-white mb-0.5 ${m.v.length > 5 ? "text-[14px]" : "text-[18px]"}`}>{m.v}</Text>
              <Text className="text-[10px] text-white/50">{m.s}</Text>
            </View>
          ))}
        </View>

        {/* Referral code */}
        <View className="mx-5 mb-3.5 bg-[#111827] border border-white/[0.13] rounded-2xl p-4">
          <Text className="text-[10px] font-semibold text-white/30 tracking-[0.1em] uppercase mb-2.5">Your Referral Code</Text>
          <View className="bg-[#0C1120] border border-white/[0.08] rounded-[10px] px-3.5 py-3 flex-row items-center justify-between mb-2.5">
            <Text className="text-[15px] font-bold text-white tracking-[0.14em]" style={{ fontFamily: "Courier" }}>AHMD-ZYP-7K3M</Text>
            <Svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.8" strokeLinecap="round">
              <Rect x="9" y="9" width="13" height="13" rx="2" />
              <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </Svg>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity className="flex-1 h-[38px] bg-white/[0.05] border border-white/[0.08] rounded-[10px] items-center justify-center">
              <Text className="text-[12px] font-medium text-white/70">Share Link</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-[38px] bg-white/[0.05] border border-white/[0.08] rounded-[10px] items-center justify-center">
              <Text className="text-[12px] font-medium text-white/70">QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings chart */}
        <View className="mx-5 mb-3.5 bg-[#111827] border border-white/[0.08] rounded-2xl p-4">
          <View className="flex-row items-start justify-between mb-3.5">
            <View className="flex-col gap-0.5">
              <Text className="text-[11px] font-semibold text-white/30 tracking-[0.08em] uppercase">Friend Earnings</Text>
              <Text className="text-[10px] text-white/50">Last 7 days</Text>
            </View>
            <View className="flex-col items-end gap-1">
              <Text className="text-[18px] font-bold text-white">+318 pts</Text>
              <View className="px-2.5 py-0.5 rounded-full bg-[rgba(52,211,153,.1)] border border-[rgba(52,211,153,.25)]">
                <Text className="text-[9px] font-semibold text-[#34D399]">↑ 22% this week</Text>
              </View>
            </View>
          </View>
          <AreaChart data={[28, 42, 35, 58, 44, 72, 94]} />
          <View className="flex-row justify-between mt-1.5 px-0.5">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <Text key={d} className="text-[9px] text-white/30 text-center flex-1">{d}</Text>
            ))}
          </View>
        </View>

        {/* Quality note */}
        <View className="mx-5 mb-3.5 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-3">
          <Text className="text-[10px] font-semibold text-white/30 tracking-[0.08em] uppercase mb-1">Q(v) = D(v) × L(v) × M(v) / 2.5</Text>
          <Text className="text-[11px] text-white/50 leading-[1.65]">You earn 8% of each friend's quality score. Friends only generate rewards after completing KYC verification.</Text>
        </View>

        {/* Friends list */}
        <View className="px-5 mb-1.5">
          <Text className="text-[10px] font-semibold text-white/30 tracking-[0.1em] uppercase mb-2.5">Friends (14)</Text>
          {friends.map((f) => (
            <View key={f.n} className={`py-[11px] border-b border-white/[0.08] ${!f.act ? "opacity-40" : ""}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-full bg-[#1A2235] border border-white/20 items-center justify-center">
                    <Text className="text-[13px] font-bold text-white">{f.n[0]}</Text>
                  </View>
                  <View className="flex-col gap-0.5">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[13px] font-semibold text-white">{f.n}</Text>
                      <View className={`px-1.5 py-0.5 rounded-full border ${f.kyc ? "bg-[rgba(52,211,153,.1)] border-[rgba(52,211,153,.25)]" : "bg-[rgba(248,113,113,.1)] border-[rgba(248,113,113,.25)]"}`}>
                        <Text className={`text-[9px] font-semibold ${f.kyc ? "text-[#34D399]" : "text-[#F87171]"}`}>
                          {f.kyc ? "KYC ✓" : "No KYC"}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-[10px] text-white/30">Day {f.d} · Q = {f.q}</Text>
                  </View>
                </View>
                <View className="flex-col items-end gap-0.5">
                  <Text className="text-[13px] font-bold text-white tabular-nums">{f.pts}</Text>
                  <Text className="text-[10px] text-white/30">pts earned</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}