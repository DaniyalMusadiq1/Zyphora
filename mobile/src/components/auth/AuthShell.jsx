import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AuthShell({ children, footer }) {
  return (
    <View className="flex-1 bg-zy-bg">
      <LinearGradient
        colors={['#1F1F3D', '#0D0D1A', '#0D0D1A']}
        locations={[0, 0.35, 1]}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1 px-5">{children}</SafeAreaView>
        {footer ? <View className="px-5 pb-6">{footer}</View> : null}
      </LinearGradient>
    </View>
  );
}
