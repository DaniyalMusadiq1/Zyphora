import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from "react-native-svg";

/* tiny SVG area chart helper */
export function AreaChart({ data, color = "rgba(255,255,255,0.85)" }) {
  const w = 296, h = 76;
  const mx = Math.max(...data), mn = Math.min(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => ({
    x: i * (w / (data.length - 1)),
    y: h - ((v - mn) / rng) * (h - 10) - 5,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join("");
  const fill = `${line}L${w},${h}L0,${h}Z`;
  const last = pts[pts.length - 1];
  return (
    <Svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>
      <Path d={fill} fill="url(#ag)" />
      <Path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last.x} cy={last.y} r="3.5" fill={color} />
    </Svg>
  );
}

/* status bar */
export function StatusBar() {
  return (
    <View className="flex-row items-end justify-between px-5 h-11 flex-shrink-0">
      <Text className="text-[13px] font-semibold text-white">9:41</Text>
      <View className="flex-row items-center gap-1">
        <Text className="text-[11px] text-white/70">▲▲▲</Text>
        <Text className="text-[11px] text-white/70">WiFi</Text>
        <Text className="text-[11px] text-white/70">100%</Text>
      </View>
    </View>
  );
}

/* bottom nav */
export function BottomNav({ active, setScreen }) {
  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      id: "friends",
      label: "Friends",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    },
  ];

  return (
    <View className="h-[68px] bg-[rgba(6,9,18,0.97)] border-t border-white/[0.08] flex-row items-center px-1 pb-2.5 flex-shrink-0">
      {tabs.map((t) => (
        <TouchableOpacity
          key={t.id}
          onPress={() => setScreen(t.id)}
          className="flex-1 flex-col items-center gap-[3px] py-1.5 rounded-xl"
        >
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={active === t.id ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.3)"}
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
          >
            <Path d={t.icon} />
          </Svg>
          <Text className={`text-[9px] font-medium tracking-widest uppercase ${active === t.id ? "text-white" : "text-white/30"}`}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}