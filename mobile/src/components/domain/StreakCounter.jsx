import { View } from 'react-native';
import { useStreak } from '../../hooks/useStreak';
import { ZyText } from '../common/ZyText';

export const StreakCounter = () => {
  const { data } = useStreak();
  const current = data?.current_streak ?? 0;
  const best = data?.best_streak ?? 0;

  return (
    <View className="flex-row justify-between rounded-xl bg-[#141428] p-3">
      <View>
        <ZyText variant="caption">Current streak</ZyText>
        <ZyText variant="h3">{current} days</ZyText>
      </View>
      <View className="items-end">
        <ZyText variant="caption">Best</ZyText>
        <ZyText variant="h3">{best}</ZyText>
      </View>
    </View>
  );
};
