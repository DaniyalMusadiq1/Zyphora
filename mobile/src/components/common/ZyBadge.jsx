import PropTypes from 'prop-types';
import { Text, View } from 'react-native';

const tones = {
  purple: 'bg-zy-purple',
  teal: 'bg-zy-teal',
  orange: 'bg-zy-orange',
  yellow: 'bg-zy-yellow',
  red: 'bg-zy-red',
};

export const ZyBadge = ({ label, tone = 'purple' }) => {
  return (
    <View className={`self-start rounded-full px-3 py-1 ${tones[tone]}`}>
      <Text className="text-[11px] font-semibold uppercase text-zy-bg">{label}</Text>
    </View>
  );
};

ZyBadge.propTypes = {
  label: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(['purple', 'teal', 'orange', 'yellow', 'red']),
};
