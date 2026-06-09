import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Svg, { Circle as SvgCircle, Path, Polygon } from "react-native-svg";
import { StatusBar, BottomNav } from "../components/SharedComponents";

export default function HomeScreen({ setScreen }) {
  const boosts = [
    { l: "Streak bonus (day 42)", v: "+142%" },
    { l: "Ads watched (3/3)", v: "+30%" },
    { l: "Quiz done", v: "+12%" },
    { l: "KYC verified", v: "×1.0D" },
    { l: "Premium task", v: "+0%", dim: true },
  ];
  const metrics = [
    { l: "Streak", v: "42 days", s: "🔥 Active" },
    { l: "Momentum", v: "2.18×", s: "Growing" },
    { l: "Friends", v: "14", s: "Active" },
  ];

  return (
    <View className="flex-1 bg-[#070B14]">
      <StatusBar />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Identity */}
        <View className="flex-row items-center justify-between px-5 pb-3 pt-1">
          <View className="flex-row items-center gap-3">
            <View className="w-[42px] h-[42px] rounded-full bg-[#1A2235] border border-white/20 items-center justify-center">
              <Text className="text-[15px] font-bold text-white">AH</Text>
            </View>
            <View className="flex-col gap-0.5">
              <Text className="text-[16px] font-bold text-white">Ahmed Hassan</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-[10px] text-white/50">Day 0 Founder</Text>
                <Text className="text-[10px] text-white/30">·</Text>
                <Text className="text-[10px] text-white/50">Pioneer</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity className="relative w-9 h-9 bg-[#111827] border border-white/[0.08] rounded-xl items-center justify-center">
            <Svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round">
              <Path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </Svg>
            <View className="absolute -top-[3px] -right-[3px] w-3.5 h-3.5 rounded-full bg-white border-2 border-[#070B14] items-center justify-center">
              <Text className="text-[7px] font-bold text-black">3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Token total */}
        <View className="px-5 mb-3.5">
          <View className="bg-[#111827] border border-white/[0.13] rounded-[18px] px-5 py-[18px]">
            <Text className="text-[11px] font-medium text-white/30 tracking-[0.1em] uppercase mb-1">Total ZYP Tokens</Text>
            <Text className="text-[44px] font-extrabold text-white leading-none">12,847</Text>
          </View>
        </View>

        {/* Metrics */}
        <View className="px-5 flex-row gap-2 mb-3.5">
          {metrics.map((m) => (
            <View key={m.l} className="flex-1 bg-[#111827] border border-white/[0.08] rounded-xl p-3">
              <Text className="text-[10px] font-medium text-white/30 tracking-[0.08em] uppercase mb-0.5">{m.l}</Text>
              <Text className="text-[18px] font-bold text-white mb-0.5">{m.v}</Text>
              <Text className="text-[10px] text-white/50">{m.s}</Text>
            </View>
          ))}
        </View>

        {/* Mining ring */}
        <View className="items-center py-2 pb-3">
          <View className="relative w-[168px] h-[168px]">
            <Svg width="168" height="168" viewBox="0 0 168 168" className="absolute">
              <SvgCircle cx="84" cy="84" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <SvgCircle cx="84" cy="84" r="70" fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="12" strokeLinecap="round" strokeDasharray="440" strokeDashoffset="108" rotation="-90" origin="84,84" />
            </Svg>
            <View className="absolute inset-0 items-center justify-center gap-[3px]">
              <Text className="text-[10px] font-medium text-white/30 tracking-[0.1em] uppercase">Today</Text>
              <Text className="text-[28px] font-extrabold text-white leading-none">+284</Text>
              <Text className="text-[11px] text-white/50">points</Text>
            </View>
          </View>
          <TouchableOpacity className="mt-2.5 flex-row items-center gap-1 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.13]">
            <Text className="text-[10px] font-semibold text-white/50 tracking-[0.05em]">TAP TO MINE</Text>
          </TouchableOpacity>
        </View>

        {/* Daily reward + ad */}
        <View className="px-5 flex-row gap-2 mb-3.5">
          <View className="flex-1 bg-[#111827] border border-white/[0.08] rounded-xl p-3">
            <Text className="text-[10px] font-medium text-white/30 tracking-[0.08em] uppercase mb-0.5">Daily Reward</Text>
            <Text className="text-[18px] font-bold text-white mb-0.5">+130 pts</Text>
            <Text className="text-[10px] text-white/50">Rate: 2.18× · Day 42</Text>
          </View>
          <TouchableOpacity
            className="flex-1 bg-[#111827] border border-white/[0.08] rounded-xl p-3 relative overflow-hidden"
            onPress={() => setScreen("ad")}
          >
            <Text className="text-[10px] font-medium text-white/30 tracking-[0.08em] uppercase mb-0.5">Watch Ad</Text>
            <Text className="text-[18px] font-bold text-white mb-0.5">+30 pts</Text>
            <View className="flex-row items-center gap-1">
              <Svg width="11" height="11" viewBox="0 0 24 24"><Polygon points="5 3 19 12 5 21 5 3" fill="#34D399" /></Svg>
              <Text className="text-[10px] text-[#34D399]">3 left today</Text>
            </View>
          </TouchableOpacity>
        </View>

     
      </ScrollView>
      <BottomNav active="home" setScreen={setScreen} />
    </View>
  );
}