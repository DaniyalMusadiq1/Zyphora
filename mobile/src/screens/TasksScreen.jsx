import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, completeTask } from "../store/slices/taskSlice";
import { Ionicons } from '@expo/vector-icons';

export default function TasksScreen({ navigation }) {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.task);
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  const filters = ["All", "Pending", "Completed", "Failed"];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      await dispatch(fetchTasks()).unwrap();
    } catch (err) {
      // Error handled by middleware
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleCompleteTask = async (task) => {
    if (completingId || task.status === 'completed') return;

    Alert.alert(
      "Complete Task",
      `Are you sure you want to submit "${task.title}" for verification?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            setCompletingId(task.id);
            try {
              await dispatch(completeTask(task.id)).unwrap();
              Alert.alert("Success", "Task submitted for verification! Points will be awarded upon approval.");
              loadTasks();
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to submit task");
            } finally {
              setCompletingId(null);
            }
          }
        }
      ]
    );
  };

  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.status.toLowerCase() === filter.toLowerCase());

  const getStatusBadgeClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { view: "bg-[rgba(245,158,11,.1)] border-[rgba(245,158,11,.25)]", text: "text-[#F59E0B]" };
      case "completed":
        return { view: "bg-[rgba(52,211,153,.1)] border-[rgba(52,211,153,.25)]", text: "text-[#34D399]" };
      case "failed":
        return { view: "bg-[rgba(248,113,113,.1)] border-[rgba(248,113,113,.25)]", text: "text-[#F87171]" };
      case "verifying":
        return { view: "bg-[rgba(99,102,241,.1)] border-[rgba(99,102,241,.25)]", text: "text-[#6366F1]" };
      default:
        return { view: "bg-white/[0.05] border-white/[0.13]", text: "text-white/50" };
    }
  };

  const getIconForTask = (type) => {
    const icons = {
      social: { name: "logo-twitter", color: "#1DA1F2" },
      video: { name: "logo-youtube", color: "#FF0000" },
      app: { name: "download-outline", color: "#6366F1" },
      referral: { name: "people-outline", color: "#10B981" },
      discord: { name: "chatbubbles-outline", color: "#5865F2" },
    };
    return icons[type] || { name: "checkmark-circle-outline", color: "#6366F1" };
  };

  if (loading && tasks.length === 0) {
    return (
      <View className="flex-1 bg-[#070B14] items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-gray-400 mt-4">Loading tasks...</Text>
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
          <Text className="text-[28px] font-bold text-white">Tasks</Text>
          <Text className="text-gray-400 text-sm mt-1">Complete tasks to earn ZPH tokens</Text>
        </View>

        {/* Progress Summary */}
        <View className="mx-5 mt-2 p-4 rounded-2xl bg-[#1E293B] border border-gray-800 flex-row items-center justify-between">
          <View>
            <Text className="text-gray-400 text-xs">Progress</Text>
            <Text className="text-white font-bold text-lg">
              {tasks.filter(t => t.status?.toLowerCase() === 'completed').length} / {tasks.length} done
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="trophy" size={20} color="#F59E0B" />
            <Text className="text-[#F59E0B] font-bold">
              {tasks.reduce((sum, t) => t.status?.toLowerCase() === 'completed' ? sum + (t.points || 0) : sum, 0)} pts
            </Text>
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mt-4 mb-2"
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`px-5 py-2.5 mx-1 rounded-full ${
                filter === f 
                  ? "bg-indigo-600 border border-indigo-500" 
                  : "bg-[#1E293B] border border-gray-700"
              }`}
            >
              <Text className={`text-[13px] ${filter === f ? "font-bold text-white" : "font-medium text-gray-400"}`}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Error Display */}
        {error && (
          <View className="mx-5 my-3 p-4 rounded-xl bg-red-900/20 border border-red-800/50 flex-row items-center gap-3">
            <Ionicons name="alert-circle" size={20} color="#F87171" />
            <Text className="text-red-400 text-sm flex-1">{error}</Text>
          </View>
        )}

        {/* Task list */}
        {filtered.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="clipboard-outline" size={64} color="#374151" />
            <Text className="text-gray-500 text-lg mt-4 font-semibold">No tasks found</Text>
            <Text className="text-gray-600 text-sm mt-1">Try changing the filter</Text>
          </View>
        ) : (
          filtered.map((t) => {
            const badge = getStatusBadgeClasses(t.status);
            const icon = getIconForTask(t.type);
            const isCompleting = completingId === t.id;

            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => handleCompleteTask(t)}
                disabled={t.status?.toLowerCase() === 'completed' || t.status?.toLowerCase() === 'verifying' || isCompleting}
                className="mx-5 mb-3 bg-[#111827] border border-white/[0.08] rounded-2xl p-4 active:scale-[0.98] transition-transform"
              >
                <View className="flex-row items-start gap-3 mb-3">
                  <View
                    className="w-[52px] h-[52px] rounded-[16px] items-center justify-center"
                    style={{ backgroundColor: `${icon.color}15`, borderColor: `${icon.color}30`, borderWidth: 1 }}
                  >
                    <Ionicons name={icon.name} size={26} color={icon.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold text-white">{t.title}</Text>
                    <Text className="text-[12px] text-gray-400 mt-1 leading-5">{t.description}</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center justify-between border-t border-gray-800 pt-3">
                  <View className="flex-row items-center gap-2">
                    <View className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 items-center justify-center">
                      <Text className="text-[10px] font-bold text-indigo-400">Z</Text>
                    </View>
                    <Text className="text-[14px] font-bold text-white">{t.points}</Text>
                    <Text className="text-[11px] text-gray-500">points</Text>
                  </View>
                  
                  <View className={`px-3 py-1.5 rounded-full border ${badge.view}`}>
                    {isCompleting ? (
                      <ActivityIndicator size="small" color="#F59E0B" />
                    ) : (
                      <Text className={`text-[11px] font-bold ${badge.text}`}>{t.status || "Pending"}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}