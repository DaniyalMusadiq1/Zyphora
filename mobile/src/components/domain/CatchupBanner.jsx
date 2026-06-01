import { View } from 'react-native';
import { useScore } from '../../hooks/useScore';
import { ZyText } from '../common/ZyText';

export const CatchupBanner = () => {
  const { snapshot } = useScore();
  const omega = Number(snapshot?.catch_up_omega ?? 0);
  if (omega <= 0.01) {
    return null;
  }
  return (
    <View className="mb-4 rounded-xl bg-zy-orange/20 px-4 py-3">
      <ZyText variant="caption" className="text-zy-orange">
        Catch-up Ω active · network gap detected
      </ZyText>
      <ZyText variant="mono" className="mt-1">
        Ω = {omega.toFixed(4)}
      </ZyText>
    </View>
  );
};
