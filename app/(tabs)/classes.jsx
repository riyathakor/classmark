import { View, Text, SafeAreaView } from 'react-native';

export default function Classes() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6 pt-4">
        <Text className="text-2xl font-bold text-text">Classes</Text>
        <Text className="mt-1 text-base text-muted">
          Add, edit, and manage your classes and students here. This screen
          will be built in a later stage.
        </Text>
      </View>
    </SafeAreaView>
  );
}
