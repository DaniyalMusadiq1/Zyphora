import { View } from 'react-native';
import { ZyText } from '../common/ZyText';

export const LeaderboardRow = ({ rank, name, score }) => {
  return (
    <View className="flex-row items-center justify-between py-2">
      <ZyText variant="body">
        #{rank} · {name}
      </ZyText>
      <ZyText variant="mono">{Number(score).toFixed(4)}</ZyText>
    </View>
  );
};
