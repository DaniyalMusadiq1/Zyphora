import { View } from 'react-native';
import { useScore } from '../../hooks/useScore';
import { ZyCard } from '../common/ZyCard';
import { ZyText } from '../common/ZyText';

export const ScoreDisplay = () => {
  const { snapshot } = useScore();
  const ps = snapshot?.ps_total ?? snapshot?.PS_total ?? '—';

  return (
    <ZyCard>
      <ZyText variant="caption">Proof-of-participation score</ZyText>
      <ZyText variant="h2" className="mt-2 font-mono">
        {String(ps)}
      </ZyText>
    </ZyCard>
  );
};
