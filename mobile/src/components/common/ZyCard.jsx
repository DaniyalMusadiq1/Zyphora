import PropTypes from 'prop-types';
import { View } from 'react-native';

export const ZyCard = ({ children, className = '' }) => {
  return (
    <View className={`rounded-2xl bg-zy-card p-4 shadow-lg shadow-black/40 ${className}`}>
      {children}
    </View>
  );
};

ZyCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
