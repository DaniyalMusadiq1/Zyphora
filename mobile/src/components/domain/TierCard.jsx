import { View } from 'react-native';
import { ZyBadge } from '../common/ZyBadge';
import { ZyText } from '../common/ZyText';

export const TierCard = ({ tier = 0 }) => {
  return (
    <View className="rounded-2xl bg-zy-card p-4">
      <View className="flex-row items-center justify-between">
        <ZyText variant="h3">KYC tier</ZyText>
        <ZyBadge label={`Tier ${tier}`} tone="teal" />
      </View>
      <ZyText variant="caption" className="mt-2">
        Higher tiers unlock deeper participation caps and governance alignment.
      </ZyText>
    </View>
  );
};
