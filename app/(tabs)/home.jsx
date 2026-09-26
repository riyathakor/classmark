import { View, Text, SafeAreaView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function Home() {
  const { teacher } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6 pt-4">
        <Text className="text-2xl font-bold text-text">
          Welcome, {teacher?.name?.split(' ')[0]} 👋
        </Text>
        <Text className="mt-1 text-base text-muted">
          Here's your overview for today.
        </Text>

        {/* Dashboard stats/shortcuts will be built here in a later stage */}
        <View className="mt-6 rounded-xl border border-border bg-card p-4">
          <Text className="text-sm text-muted">
            Today's classes, quick attendance shortcut, and overall stats will
            appear here once the Attendance module is built.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
