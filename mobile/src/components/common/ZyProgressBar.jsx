import PropTypes from 'prop-types';
import { View } from 'react-native';

export const ZyProgressBar = ({ value = 0, max = 1, className = '' }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View className={`h-2 w-full overflow-hidden rounded-full bg-[#2A2A3F] ${className}`}>
      <View className="h-full rounded-full bg-zy-purple" style={{ width: `${pct}%` }} />
    </View>
  );
};

ZyProgressBar.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  className: PropTypes.string,
};
