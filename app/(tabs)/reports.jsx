import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useClasses } from '../../src/context/ClassContext';
import { useAttendance } from '../../src/context/AttendanceContext';
import StatBar from '../../src/components/StatBar';
import StatCard from '../../src/components/StatCard';
import SectionTitle from '../../src/components/SectionTitle';
import { colors } from '../../src/theme/colors';
import { cardStyle, CHIP, screenTitleStyle, screenSubtitleStyle } from '../../src/theme/ui';
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
    ? Math.round(markedClasses.reduce((sum, s) => sum + s.percent, 0) / markedClasses.length)
    : null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={screenTitleStyle}>Reports</Text>
        <Text style={screenSubtitleStyle}>Attendance by class and date</Text>

        {/* Date filter */}
        <Pressable
          onPress={() => setShowPicker(true)}
          style={[
            cardStyle,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 14,
              marginTop: 24,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: CHIP,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="calendar" size={18} color={colors.text} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
              {formatDisplayDate(dateKey)}
            </Text>
          </View>
          <View
            style={{
              height: 32,
              paddingHorizontal: 14,
              borderRadius: 16,
              backgroundColor: CHIP,
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Change</Text>
          </View>
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

        {/* Summary for the selected date */}
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 14 }}>
          <StatCard
            value={overallPercent == null ? '—' : `${overallPercent}%`}
            label="Overall Attendance"
            icon="pie-chart"
            iconColor={colors.text}
            valueColor={colors.text}
          />
          <StatCard
            value={`${markedClasses.length}/${activeClasses.length}`}
            label="Classes Marked"
            icon="checkmark-circle"
            iconColor={colors.success}
            valueColor={colors.text}
          />
        </View>

        {/* Class-wise bars */}
        <SectionTitle>Class-wise Attendance</SectionTitle>

        {activeClasses.length === 0 ? (
          <View style={[cardStyle, { padding: 24, alignItems: 'center' }]}>
            <Text style={{ fontSize: 14, textAlign: 'center', color: colors.muted }}>
              No active classes yet. Add one from the Classes tab to get started.
            </Text>
          </View>
        ) : (
          <View style={[cardStyle, { padding: 18, paddingBottom: 6 }]}>
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