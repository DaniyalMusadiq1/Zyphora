import { View } from 'react-native';
import { useScore } from '../../hooks/useScore';
import { ZyProgressBar } from '../common/ZyProgressBar';
import { ZyText } from '../common/ZyText';

export const MomentumMeter = () => {
  const { snapshot } = useScore();
  const m = Number(snapshot?.momentum_m ?? 0);

  return (
    <View className="mt-4">
      <ZyText variant="caption">Momentum (m)</ZyText>
      <ZyProgressBar value={m} max={1} className="mt-2" />
      <ZyText variant="mono" className="mt-1">
        φ(m) ≈ {m.toFixed(4)}
      </ZyText>
    </View>
  );
};
