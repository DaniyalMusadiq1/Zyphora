import PropTypes from 'prop-types';
import { Text, View } from 'react-native';

export const ZyAvatar = ({ name = '?', size = 44 }) => {
  const initial = (name && name.trim()[0]) || '?';
  return (
    <View
      className="items-center justify-center rounded-full bg-zy-purple"
      style={{ width: size, height: size }}
    >
      <Text className="font-bold text-zy-white" style={{ fontSize: size * 0.4 }}>
        {initial.toUpperCase()}
      </Text>
    </View>
  );
};

ZyAvatar.propTypes = {
  name: PropTypes.string,
  size: PropTypes.number,
};
