import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useClasses } from '../../src/context/ClassContext';
import { colors } from '../../src/theme/colors';

export default function Attendance() {
  const { classes, isLoading } = useClasses();
  const activeClasses = classes.filter((c) => c.isActive);

  function renderCard({ item }) {
    return (
      <Pressable
        onPress={() => router.push(`/attendance/${item.id}`)}
        className="mb-3 rounded-xl border border-border bg-card p-4"
      >
        <Text className="text-base font-semibold text-text">{item.name}</Text>
        <Text className="mt-1 text-xs text-muted">Tap to mark attendance</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-6 pt-4">
        <Text className="mb-4 text-2xl font-bold text-text">Attendance</Text>

        {!isLoading && activeClasses.length === 0 ? (
          <View className="mt-10 items-center">
            <Text className="text-center text-base text-muted">
              No active classes yet. Add a class first from the Classes tab.
            </Text>
          </View>
        ) : (
          <FlatList
            data={activeClasses}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}