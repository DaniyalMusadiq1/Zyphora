import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from '@expo/vector-icons';

import { fetchKycStatus } from "../redux/slices/kycSlice";
import { fetchScore } from "../redux/slices/scoreSlice";

export default function WalletScreen({ navigation }) {
  const dispatch = useDispatch();
  const { score, loading: scoreLoading, error: scoreError } = useSelector((state) => state.score);
  const { kycStatus, loading: kycLoading } = useSelector((state) => state.kyc);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchScore()).unwrap(),
        dispatch(fetchKycStatus()).unwrap()
      ]);
    } catch (err) {
      // Error handled by middleware
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleWithdraw = () => {
    Alert.alert(
      "Withdraw Funds",
      "Minimum withdrawal amount is 1000 ZPH. Would you like to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Proceed", 
          onPress: () => navigation.navigate('Kyc') 
        }
      ]
    );
  };

  const getKycStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return '#34D399';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#F87171';
      default: return '#6366F1';
    }
  };

  const getKycStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'shield-outline';
    }
  };

  if (scoreLoading && !score) {
    return (
      <View className="flex-1 bg-[#070B14] items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-gray-400 mt-4">Loading wallet...</Text>
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
        <View className="px-5 pt-6 pb-4">
          <Text className="text-[28px] font-bold text-white">Wallet</Text>
          <Text className="text-gray-400 text-sm mt-1">Manage your earnings and withdrawals</Text>
        </View>

        {/* Balance Card */}
        <View className="mx-5 mb-4 p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg shadow-indigo-900/40">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-indigo-200 text-sm font-medium">Total Balance</Text>
            <TouchableOpacity className="p-2 bg-white/10 rounded-full">
              <Ionicons name="eye" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-4xl font-bold text-white mb-1">
            {(score?.total_points || 0).toLocaleString()}
          </Text>
          <Text className="text-indigo-200 text-sm">ZPH Tokens</Text>
          
          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity 
              onPress={handleWithdraw}
              disabled={(score?.total_points || 0) < 1000}
              className={`flex-1 py-3.5 rounded-xl items-center flex-row justify-center gap-2 ${
                (score?.total_points || 0) >= 1000 
                  ? 'bg-white' 
                  : 'bg-white/30'
              }`}
            >
              <Ionicons 
                name="wallet-outline" 
                size={20} 
                color={(score?.total_points || 0) >= 1000 ? '#4F46E5' : '#9CA3AF'} 
              />
              <Text className={`font-bold ${
                (score?.total_points || 0) >= 1000 ? 'text-indigo-700' : 'text-gray-500'
              }`}>
                Withdraw
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3.5 rounded-xl bg-white/10 border border-white/20 items-center flex-row justify-center gap-2">
              <Ionicons name="swap-horizontal" size={20} color="white" />
              <Text className="font-bold text-white">Swap</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KYC Status Card */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Kyc')}
          className="mx-5 mb-4 p-5 rounded-2xl bg-[#1E293B] border border-gray-800 active:scale-[0.98]"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <View className={`w-12 h-12 rounded-xl items-center justify-center`} 
                style={{ backgroundColor: `${getKycStatusColor(kycStatus?.status)}20` }}>
                <Ionicons 
                  name={getKycStatusIcon(kycStatus?.status)} 
                  size={24} 
                  color={getKycStatusColor(kycStatus?.status)} 
                />
              </View>
              <View>
                <Text className="text-gray-400 text-xs uppercase tracking-wider font-semibold">KYC Status</Text>
                <Text className="text-white font-bold text-lg">
                  {kycStatus?.status === 'verified' ? 'Verified' : 
                   kycStatus?.status === 'pending' ? 'In Review' : 
                   kycStatus?.status === 'rejected' ? 'Rejected' : 'Not Started'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6366F1" />
          </View>
          
          {kycStatus?.status !== 'verified' && (
            <View className="mt-3 p-3 rounded-xl bg-indigo-900/20 border border-indigo-500/20">
              <Text className="text-indigo-300 text-xs">
                Complete KYC verification to unlock withdrawals and earn bonus points!
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Stats Grid */}
        <View className="px-5 mb-4">
          <Text className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">Earnings Overview</Text>
          <View className="flex-row gap-3">
            {[
              { label: "Total Earned", value: (score?.total_earned || 0).toLocaleString(), icon: "trending-up", color: "#10B981" },
              { label: "Withdrawn", value: (score?.withdrawn || 0).toLocaleString(), icon: "arrow-down-circle", color: "#F59E0B" },
              { label: "Pending", value: (score?.pending || 0).toLocaleString(), icon: "time", color: "#6366F1" },
              { label: "Bonus", value: (score?.bonus || 0).toLocaleString(), icon: "gift", color: "#EC4899" },
            ].map((stat, idx) => (
              <View key={idx} className="flex-1 bg-[#1E293B] border border-gray-800 rounded-xl p-3">
                <View className={`w-8 h-8 rounded-lg mb-2 items-center justify-center`} 
                  style={{ backgroundColor: `${stat.color}20` }}>
                  <Ionicons name={stat.icon} size={16} color={stat.color} />
                </View>
                <Text className="text-[8px] font-medium text-gray-400 uppercase">{stat.label}</Text>
                <Text className="text-white font-bold text-sm mt-0.5">{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Recent Activity</Text>
            <TouchableOpacity>
              <Text className="text-indigo-400 text-xs font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-[#1E293B] border border-gray-800 rounded-2xl overflow-hidden">
            {[
              { type: "Streak Bonus", amount: "+50", date: "Today", icon: "flame", color: "#F59E0B" },
              { type: "Task Completed", amount: "+100", date: "Yesterday", icon: "checkmark-done", color: "#10B981" },
              { type: "Referral Reward", amount: "+25", date: "2 days ago", icon: "people", color: "#6366F1" },
              { type: "Withdrawal", amount: "-500", date: "5 days ago", icon: "arrow-down", color: "#F87171" },
            ].map((tx, idx) => (
              <View 
                key={idx} 
                className={`flex-row items-center justify-between p-4 ${idx !== 3 ? 'border-b border-gray-800' : ''}`}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-xl items-center justify-center`} 
                    style={{ backgroundColor: `${tx.color}20` }}>
                    <Ionicons name={tx.icon} size={18} color={tx.color} />
                  </View>
                  <View>
                    <Text className="text-white font-semibold text-sm">{tx.type}</Text>
                    <Text className="text-gray-500 text-xs">{tx.date}</Text>
                  </View>
                </View>
                <Text className={`font-bold ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Error Display */}
        {(scoreError) && (
          <View className="mx-5 mt-4 p-4 rounded-xl bg-red-900/20 border border-red-800/50 flex-row items-center gap-3">
            <Ionicons name="alert-circle" size={20} color="#F87171" />
            <Text className="text-red-400 text-sm flex-1">{scoreError}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
