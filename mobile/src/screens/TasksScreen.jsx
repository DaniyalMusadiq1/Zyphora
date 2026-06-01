import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Svg, { Path, Rect, Polygon, Circle } from "react-native-svg";
import { StatusBar, BottomNav } from "../components/SharedComponents";

export default function TasksScreen({ setScreen }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Pending", "Completed", "Missed"];

  const tasks = [
    {
      icon: (
        <Svg width="26" height="26" viewBox="0 0 24 24">
          <Path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" fill="rgba(255,40,40,.25)" stroke="rgba(255,80,80,.7)" strokeWidth="1.2" />
          <Polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="rgba(255,255,255,.85)" />
        </Svg>
      ),
      bg: "rgba(255,40,40,.06)", br: "rgba(255,80,80,.18)",
      t: "Subscribe to Channel", d: "Subscribe to the Zyphora YouTube channel",
      r: 50, status: "Pending",
    },
    {
      icon: (
        <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <Rect x="5" y="2" width="14" height="20" rx="2" fill="rgba(99,102,241,.2)" stroke="rgba(129,140,248,.7)" strokeWidth="1.2" />
          <Path d="M12 18h.01" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" />
          <Rect x="8" y="7" width="8" height="5" rx="1" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.3)" strokeWidth=".8" />
        </Svg>
      ),
      bg: "rgba(99,102,241,.07)", br: "rgba(99,102,241,.22)",
      t: "Download the App", d: "Download Zyphora from Google Play and log in",
      r: 100, status: "Completed",
    },
    {
      icon: (
        <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <Path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016 2a4.48 4.48 0 00-4.48 4.48v1A10.66 10.66 0 013 3s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" fill="rgba(29,161,242,.18)" stroke="rgba(29,161,242,.7)" strokeWidth="1.2" strokeLinecap="round" />
        </Svg>
      ),
      bg: "rgba(29,161,242,.06)", br: "rgba(29,161,242,.18)",
      t: "Follow on X / Twitter", d: "Follow @ZyphoraNetwork for launch news",
      r: 30, status: "Completed",
    },
    {
      icon: (
        <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="rgba(88,101,242,.18)" stroke="rgba(88,101,242,.7)" strokeWidth="1.2" strokeLinecap="round" />
        </Svg>
      ),
      bg: "rgba(88,101,242,.06)", br: "rgba(88,101,242,.18)",
      t: "Join Discord Server", d: "Join and verify in the official Zyphora Discord",
      r: 40, status: "Pending",
    },
    {
      icon: (
        <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="rgba(255,255,255,.5)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      bg: "rgba(255,255,255,.04)", br: "rgba(255,255,255,.1)",
      t: "Share on Social Media", d: "Share your referral link on any social platform",
      r: 25, status: "Missed",
    },
    {
      icon: (
        <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="rgba(245,158,11,.7)" strokeWidth="1.3" strokeLinecap="round" />
          <Circle cx="9" cy="7" r="4" stroke="rgba(245,158,11,.7)" strokeWidth="1.3" />
          <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="rgba(245,158,11,.7)" strokeWidth="1.3" strokeLinecap="round" />
        </Svg>
      ),
      bg: "rgba(245,158,11,.06)", br: "rgba(245,158,11,.18)",
      t: "Invite 3 Friends", d: "3 friends must complete KYC to unlock",
      r: 300, status: "Upcoming",
    },
  ];

  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "Pending":
        return {
          view: "bg-[rgba(245,158,11,.1)] border-[rgba(245,158,11,.25)]",
          text: "text-[#F59E0B]",
        };
      case "Completed":
        return {
          view: "bg-[rgba(52,211,153,.1)] border-[rgba(52,211,153,.25)]",
          text: "text-[#34D399]",
        };
      case "Missed":
        return {
          view: "bg-[rgba(248,113,113,.1)] border-[rgba(248,113,113,.25)]",
          text: "text-[#F87171]",
        };
      case "Upcoming":
        return {
          view: "bg-[rgba(129,140,248,.1)] border-[rgba(129,140,248,.25)]",
          text: "text-[#818CF8]",
        };
      default:
        return {
          view: "bg-white/[0.05] border-white/[0.13]",
          text: "text-white/50",
        };
    }
  };

  return (
    <View className="flex-1 bg-[#070B14]">
      <StatusBar />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-1 mb-1">
          <Text className="text-[22px] font-bold text-white">Tasks</Text>
          <View className="flex-row items-center gap-[3px] px-2.5 py-1 rounded-full bg-[rgba(52,211,153,.1)] border border-[rgba(52,211,153,.25)]">
            <Text className="text-[10px] font-semibold text-[#34D399]">3 / 6 done</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <View className="flex-row px-5 border-b border-white/[0.08] mb-3.5">
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`px-3.5 py-2 border-b-2 -mb-px ${filter === f ? "border-white" : "border-transparent"}`}
            >
              <Text className={`text-[12px] ${filter === f ? "font-bold text-white" : "font-medium text-white/30"}`}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task list */}
        {filtered.map((t) => {
          const badge = getStatusBadgeClasses(t.status);
          return (
            <TouchableOpacity
              key={t.t}
              className="mx-5 mb-2.5 bg-[#111827] border border-white/[0.08] rounded-2xl p-3.5"
            >
              <View className="flex-row items-start gap-3 mb-2.5">
                <View
                  className="w-[46px] h-[46px] rounded-[14px] items-center justify-center"
                  style={{ backgroundColor: t.bg, borderColor: t.br, borderWidth: 1 }}
                >
                  {t.icon}
                </View>
                <View className="flex-1 flex-col gap-0.5">
                  <Text className="text-[14px] font-semibold text-white">{t.t}</Text>
                  <Text className="text-[11px] text-white/50" numberOfLines={1}>{t.d}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-5 h-5 rounded-full bg-white/[0.08] border border-white/[0.13] items-center justify-center">
                    <Text className="text-[9px] font-bold text-white">Z</Text>
                  </View>
                  <Text className="text-[13px] font-bold text-white">{t.r}</Text>
                  <Text className="text-[11px] text-white/30">tokens</Text>
                </View>
                <View className={`px-2.5 py-0.5 rounded-full border ${badge.view}`}>
                  <Text className={`text-[10px] font-semibold ${badge.text}`}>{t.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}