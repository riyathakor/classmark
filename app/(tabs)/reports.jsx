import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useClasses } from '../../src/context/ClassContext';
import { useAttendance } from '../../src/context/AttendanceContext';
import StatBar from '../../src/components/StatBar';
import { colors } from '../../src/theme/colors';
import { todayKey, formatDisplayDate, dateKeyToDateObj, toDateKey } from '../../src/utils/date';

export default function Reports() {
  const { classes } = useClasses();
  const { getRecordForClassDate } = useAttendance();

  const [dateKey, setDateKey] = useState(todayKey());
  const [showPicker, setShowPicker] = useState(false);

  const activeClasses = classes.filter((c) => c.isActive);

  function handleDateChange(event, selectedDate) {
    setShowPicker(false);
    if (selectedDate) {
      setDateKey(toDateKey(selectedDate));
    }
  }

  const classStats = activeClasses.map((c) => {
    const record = getRecordForClassDate(c.id, dateKey);
    if (!record) {
      return { classItem: c, percent: null, present: 0, total: 0, marked: false };
    }
    const total = record.records.length;
    const present = record.records.filter((r) => r.status === 'present').length;
    const percent = total ? Math.round((present / total) * 100) : null;
    return { classItem: c, percent, present, total, marked: true };
  });

  const markedClasses = classStats.filter((s) => s.marked);
  const overallPercent = markedClasses.length
    ? Math.round(
      markedClasses.reduce((sum, s) => sum + s.percent, 0) / markedClasses.length
    )
    : null;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-4 text-2xl font-bold text-text">Reports</Text>

        <Pressable
          onPress={() => setShowPicker(true)}
          className="mb-4 flex-row items-center justify-between rounded-xl border border-border bg-card p-4"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text className="text-base font-medium text-text">{formatDisplayDate(dateKey)}</Text>
          </View>
          <Text className="text-sm text-primary">Change</Text>
        </Pressable>

        {showPicker ? (
          <DateTimePicker
            value={dateKeyToDateObj(dateKey)}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={handleDateChange}
          />
        ) : null}

        <View className="mb-5 flex-row gap-3">
          <View className="flex-1 rounded-xl border border-border bg-card p-4">
            <Text className="text-2xl font-bold text-text">
              {overallPercent == null ? '—' : `${overallPercent}%`}
            </Text>
            <Text className="mt-1 text-xs text-muted">Overall Attendance</Text>
          </View>
          <View className="flex-1 rounded-xl border border-border bg-card p-4">
            <Text className="text-2xl font-bold text-text">
              {markedClasses.length}/{activeClasses.length}
            </Text>
            <Text className="mt-1 text-xs text-muted">Classes Marked</Text>
          </View>
        </View>

        <Text className="mb-3 text-lg font-bold text-text">Class-wise Attendance</Text>

        {activeClasses.length === 0 ? (
          <View className="items-center rounded-xl border border-border bg-card p-6">
            <Text className="text-center text-sm text-muted">
              No active classes yet. Add one from the Classes tab to get started.
            </Text>
          </View>
        ) : (
          <View className="rounded-xl border border-border bg-card p-4">
            {classStats.map(({ classItem, percent, present, total, marked }) => (
              <StatBar
                key={classItem.id}
                label={classItem.name}
                percent={percent}
                subtitle={marked ? `${present}/${total} present` : 'Not marked for this date'}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}