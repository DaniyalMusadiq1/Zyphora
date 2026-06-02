import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from '@expo/vector-icons';

import * as Clipboard from 'expo-clipboard';
import { fetchReferrals, shareReferral } from "../redux/slices/referralSlice";

export default function FriendsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { referrals, referralCode, totalEarned, loading, error } = useSelector((state) => state.referral);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      await dispatch(fetchReferrals()).unwrap();
    } catch (err) {
      // Error handled by middleware
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReferrals();
    setRefreshing(false);
  };

  const handleCopyCode = async () => {
    if (!referralCode) return;
    await Clipboard.setStringAsync(referralCode);
    Alert.alert("Copied!", `Referral code ${referralCode} copied to clipboard`);
  };

  const handleShare = async () => {
    try {
      await dispatch(shareReferral()).unwrap();
    } catch (err) {
      Alert.alert("Share Failed", "Could not open share dialog");
    }
  };

  if (loading && referrals.length === 0) {
    return (
      <View className="flex-1 bg-[#070B14] items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-gray-400 mt-4">Loading friends...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#070B14]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-2">
          <Text className="text-[28px] font-bold text-white">Friends</Text>
          <Text className="text-gray-400 text-sm mt-1">Invite friends and earn together</Text>
        </View>

        {/* Stats Cards */}
        <View className="px-5 flex-row gap-2 mb-4">
          {[
            { label: "Total Friends", value: referrals.length.toString(), sub: "Active users", icon: "people", color: "#6366F1" },
            { label: "Total Earned", value: `+${totalEarned}`, sub: "From referrals", icon: "coins", color: "#10B981" },
            { label: "Avg Quality", value: "0.76", sub: "Quality rating", icon: "star", color: "#F59E0B" },
          ].map((stat, idx) => (
            <View key={idx} className="flex-1 bg-[#1E293B] border border-gray-800 rounded-xl p-3">
              <View className={`w-8 h-8 rounded-lg mb-2 items-center justify-center`} style={{ backgroundColor: `${stat.color}20` }}>
                <Ionicons name={stat.icon} size={16} color={stat.color} />
              </View>
              <Text className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">{stat.label}</Text>
              <Text className={`font-bold text-white mb-0.5 ${stat.value.length > 5 ? "text-[14px]" : "text-[18px]"}`}>{stat.value}</Text>
              <Text className="text-[9px] text-gray-500">{stat.sub}</Text>
            </View>
          ))}
        </View>

        {/* Referral Code Card */}
        <View className="mx-5 mb-4 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-5 backdrop-blur-md">
          <Text className="text-[10px] font-semibold text-indigo-300 tracking-[0.1em] uppercase mb-3">Your Referral Code</Text>
          
          <TouchableOpacity 
            onPress={handleCopyCode}
            className="bg-[#0C1120] border border-indigo-500/30 rounded-xl px-4 py-4 flex-row items-center justify-between mb-3 active:scale-[0.98]"
          >
            <Text className="text-[16px] font-bold text-white tracking-[0.12em] font-mono">
              {referralCode || "AHMD-ZYP-7K3M"}
            </Text>
            <View className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center">
              <Ionicons name="copy-outline" size={20} color="white" />
            </View>
          </TouchableOpacity>
          
          <View className="flex-row gap-2">
            <TouchableOpacity 
              onPress={handleShare}
              className="flex-1 h-[42px] bg-indigo-600 rounded-xl items-center justify-center flex-row gap-2 active:scale-[0.98]"
            >
              <Ionicons name="share-social" size={18} color="white" />
              <Text className="text-[12px] font-bold text-white">Share Link</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 h-[42px] bg-[#1E293B] border border-gray-700 rounded-xl items-center justify-center flex-row gap-2 active:scale-[0.98]"
            >
              <Ionicons name="qr-code-outline" size={18} color="#6366F1" />
              <Text className="text-[12px] font-bold text-indigo-400">QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings Summary */}
        <View className="mx-5 mb-4 bg-[#1E293B] border border-gray-800 rounded-2xl p-5">
          <View className="flex-row items-start justify-between mb-4">
            <View>
              <Text className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase">Friend Earnings</Text>
              <Text className="text-[10px] text-gray-500 mt-0.5">Last 7 days</Text>
            </View>
            <View className="items-end">
              <Text className="text-[20px] font-bold text-white">+318 pts</Text>
              <View className="mt-1 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/25 flex-row items-center gap-1">
                <Ionicons name="trending-up" size={10} color="#34D399" />
                <Text className="text-[9px] font-bold text-[#34D399]">22% this week</Text>
              </View>
            </View>
          </View>
          
          {/* Simple Chart Visualization */}
          <View className="h-24 flex-row items-end justify-between gap-1 mb-2">
            {[40, 65, 45, 80, 55, 90, 100].map((height, idx) => (
              <View key={idx} className="flex-1 items-center">
                <View 
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-purple-500 opacity-80"
                  style={{ height: `${height}%` }}
                />
              </View>
            ))}
          </View>
          <View className="flex-row justify-between mt-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
              <Text key={idx} className="text-[9px] text-gray-500 text-center flex-1">{day}</Text>
            ))}
          </View>
        </View>

        {/* Info Note */}
        <View className="mx-5 mb-4 bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-4 flex-row gap-3">
          <Ionicons name="information-circle" size={20} color="#6366F1" />
          <View className="flex-1">
            <Text className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">How It Works</Text>
            <Text className="text-[11px] text-gray-400 leading-5">
              You earn 8% of each friend's activity. Friends must complete KYC verification to start generating rewards.
            </Text>
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View className="mx-5 mb-4 p-4 rounded-xl bg-red-900/20 border border-red-800/50 flex-row items-center gap-3">
            <Ionicons name="alert-circle" size={20} color="#F87171" />
            <Text className="text-red-400 text-sm flex-1">{error}</Text>
          </View>
        )}

        {/* Friends List */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
              Friends ({referrals.length})
            </Text>
            <TouchableOpacity>
              <Text className="text-[11px] font-semibold text-indigo-400">View All</Text>
            </TouchableOpacity>
          </View>

          {referrals.length === 0 ? (
            <View className="items-center justify-center py-16 bg-[#1E293B] border border-gray-800 rounded-2xl">
              <Ionicons name="people-outline" size={48} color="#374151" />
              <Text className="text-gray-400 text-base font-semibold mt-3">No friends yet</Text>
              <Text className="text-gray-500 text-sm mt-1 mb-4">Invite your first friend!</Text>
              <TouchableOpacity 
                onPress={handleShare}
                className="px-6 py-3 bg-indigo-600 rounded-xl flex-row items-center gap-2"
              >
                <Ionicons name="person-add" size={18} color="white" />
                <Text className="text-white font-bold">Invite Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            referrals.slice(0, 10).map((friend, index) => (
              <View 
                key={friend.id || index} 
                className={`py-4 border-b border-gray-800 ${!friend.isActive ? "opacity-40" : ""}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 items-center justify-center border-2 border-gray-800">
                      <Text className="text-[15px] font-bold text-white">{(friend.name || "U")[0].toUpperCase()}</Text>
                    </View>
                    <View>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-[14px] font-semibold text-white">{friend.name || `User ${index + 1}`}</Text>
                        {friend.kycVerified ? (
                          <View className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/25">
                            <Text className="text-[9px] font-bold text-[#34D399]">KYC ✓</Text>
                          </View>
                        ) : (
                          <View className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25">
                            <Text className="text-[9px] font-bold text-[#F87171]">No KYC</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-[10px] text-gray-500 mt-0.5">
                        Day {friend.daysSinceJoin || 1} · Q = {friend.qualityScore || "0.00"}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-[14px] font-bold text-white">+{friend.pointsEarned || 0}</Text>
                    <Text className="text-[9px] text-gray-500">pts earned</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
