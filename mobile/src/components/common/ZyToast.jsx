import PropTypes from 'prop-types';
import { Pressable, Text, View } from 'react-native';

export const ZyToast = ({ visible, message, onDismiss }) => {
  if (!visible || !message) {
    return null;
  }
  return (
    <View className="absolute bottom-8 left-4 right-4 z-50 rounded-xl bg-zy-card px-4 py-3 shadow-lg">
      <Pressable onPress={onDismiss}>
        <Text className="text-center text-[14px] text-zy-light">{message}</Text>
      </Pressable>
    </View>
  );
};

ZyToast.propTypes = {
  visible: PropTypes.bool,
  message: PropTypes.string,
  onDismiss: PropTypes.func,
};
