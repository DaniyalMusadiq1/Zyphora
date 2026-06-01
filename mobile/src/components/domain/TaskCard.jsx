import { View } from 'react-native';
import { ZyBadge } from '../common/ZyBadge';
import { ZyButton } from '../common/ZyButton';
import { ZyText } from '../common/ZyText';

export const TaskCard = ({ task, onComplete, completing }) => {
  return (
    <View className="mb-3 rounded-2xl bg-zy-card p-4">
      <View className="flex-row items-center justify-between">
        <ZyText variant="h3">{task.title}</ZyText>
        {task.is_premium ? <ZyBadge label="Premium" tone="yellow" /> : null}
      </View>
      {task.description ? (
        <ZyText variant="body" className="mt-2">
          {task.description}
        </ZyText>
      ) : null}
      <View className="mt-3">
        <ZyButton label="Complete" loading={completing} onPress={() => onComplete(task.id)} />
      </View>
    </View>
  );
};
