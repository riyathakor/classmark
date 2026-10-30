import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useClasses } from '../../src/context/ClassContext';
import { useStudents } from '../../src/context/StudentContext';
import { useAttendance } from '../../src/context/AttendanceContext';
import { todayKey, formatDisplayDate } from '../../src/utils/date';

export default function Home() {
  const { teacher } = useAuth();
  const { classes } = useClasses();
  const { students } = useStudents();
  const { getRecordForClassDate } = useAttendance();

  const activeClasses = classes.filter((c) => c.isActive);
  const today = todayKey();

  const todayStatusByClass = activeClasses.map((c) => ({
    classItem: c,
    record: getRecordForClassDate(c.id, today),
  }));
  const submittedCount = todayStatusByClass.filter((s) => s.record).length;
  const pendingCount = activeClasses.length - submittedCount;

  function renderClassRow({ classItem, record }) {
    const isSubmitted = !!record;
    let presentCount = 0;
    if (record) {
      presentCount = record.records.filter((r) => r.status === 'present').length;
    }

    return (
      <Pressable
        key={classItem.id}
        onPress={() => router.push(`/attendance/${classItem.id}`)}
        className="mb-3 flex-row items-center justify-between rounded-xl border border-border bg-card p-4"
      >
        <View className="flex-1">
          <Text className="text-base font-semibold text-text">{classItem.name}</Text>
          {isSubmitted ? (
            <Text className="mt-1 text-xs text-success">
              Submitted · {presentCount}/{record.records.length} present
            </Text>
          ) : (
            <Text className="mt-1 text-xs text-muted">Not marked yet</Text>
          )}
        </View>

        <View
          className={`rounded-full px-3 py-1 ${isSubmitted ? 'bg-success/10' : 'bg-primary/10'}`}
        >
          <Text className={`text-xs font-semibold ${isSubmitted ? 'text-success' : 'text-primary'}`}>
            {isSubmitted ? 'Done' : 'Mark now'}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-text">
          Welcome, {teacher?.name?.split(' ')[0]} 👋
        </Text>
        <Text className="mt-1 text-base text-muted">{formatDisplayDate(today)}</Text>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-xl border border-border bg-card p-4">
            <Text className="text-2xl font-bold text-text">{activeClasses.length}</Text>
            <Text className="mt-1 text-xs text-muted">Active Classes</Text>
          </View>
          <View className="flex-1 rounded-xl border border-border bg-card p-4">
            <Text className="text-2xl font-bold text-text">{students.length}</Text>
            <Text className="mt-1 text-xs text-muted">Total Students</Text>
          </View>
        </View>

        <View className="mt-3 flex-row gap-3">
          <View className="flex-1 rounded-xl border border-border bg-card p-4">
            <Text className="text-2xl font-bold text-success">{submittedCount}</Text>
            <Text className="mt-1 text-xs text-muted">Marked Today</Text>
          </View>
          <View className="flex-1 rounded-xl border border-border bg-card p-4">
            <Text className="text-2xl font-bold text-danger">{pendingCount}</Text>
            <Text className="mt-1 text-xs text-muted">Pending Today</Text>
          </View>
        </View>

        <Text className="mb-3 mt-6 text-lg font-bold text-text">Today's Classes</Text>

        {activeClasses.length === 0 ? (
          <View className="items-center rounded-xl border border-border bg-card p-6">
            <Text className="text-center text-sm text-muted">
              No active classes yet. Add one from the Classes tab to get started.
            </Text>
          </View>
        ) : (
          todayStatusByClass.map(renderClassRow)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}