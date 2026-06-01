import { View } from 'react-native';
import { ZyText } from '../common/ZyText';

export const ReferralRow = ({ referral }) => {
  const name = referral?.referee?.name || `User #${referral?.referee_id}`;
  return (
    <View className="flex-row items-center justify-between border-b border-[#2A2A3F] py-3">
      <ZyText variant="body">{name}</ZyText>
      <ZyText variant="mono">γ {Number(referral?.gamma_penalty ?? 1).toFixed(2)}</ZyText>
    </View>
  );
};
