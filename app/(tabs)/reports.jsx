import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useClasses } from '../../src/context/ClassContext';
import { useStudents } from '../../src/context/StudentContext';
import { useAttendance } from '../../src/context/AttendanceContext';
import StatCard from '../../src/components/StatCard';
import SectionTitle from '../../src/components/SectionTitle';
import { colors } from '../../src/theme/colors';
import { cardStyle, CHIP, screenTitleStyle, screenSubtitleStyle } from '../../src/theme/ui';
import { getStudentSessionStats } from '../../src/utils/sessions';
import { todayKey, formatDisplayDate, dateKeyToDateObj, toDateKey } from '../../src/utils/date';

function Legend({ color, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 14 }}>
      <View
        style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color, marginRight: 6 }}
      />
      <Text style={{ fontSize: 12, color: colors.muted }}>{label}</Text>
    </View>
  );
}

// Small pill showing the student's status on the selected date.
function DayBadge({ status }) {
  const styles = {
    present: { label: 'Present', bg: 'rgba(31, 160, 82, 0.12)', fg: colors.success },
    absent: { label: 'Absent', bg: 'rgba(217, 54, 54, 0.10)', fg: colors.danger },
    none: { label: 'No session', bg: 'rgba(107, 122, 144, 0.14)', fg: colors.muted },
  };
  const s = styles[status];
  if (!s) return null;
  return (
    <View
      style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10, backgroundColor: s.bg }}
    >
      <Text style={{ fontSize: 11, fontWeight: '700', color: s.fg }}>{s.label}</Text>
    </View>
  );
}

function StudentSessionCard({ student, stats, dayStatus }) {
  const { present, absent, used } = stats;
  const total = student.totalSessions ?? null;
  const base = Math.max(total ?? 0, used); // what the full bar stands for
  const presentPct = base > 0 ? Math.min((present / base) * 100, 100) : 0;
  const absentPct = base > 0 ? Math.min((absent / base) * 100, 100) : 0;
  const left = total != null ? Math.max(total - used, 0) : null;
  const rate = used > 0 ? Math.round((present / used) * 100) : null;

  return (
    <View style={[cardStyle, { padding: 14, marginBottom: 12 }]}>
      {/* Name + status on the selected date */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 8 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: CHIP,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
              {student.rollNumber}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={{ flex: 1, fontSize: 16, fontWeight: '700', color: colors.text }}
          >
            {student.name}
          </Text>
        </View>
        <DayBadge status={dayStatus} />
      </View>

      {/* Sessions + attendance rate */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
          {total != null ? `${used}/${total} sessions` : `${used} sessions`}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
          {rate == null ? '—' : `${rate}% attended`}
        </Text>
      </View>

      {/* Stacked bar: present (green), absent (red), sessions left (gray) */}
      <View
        style={{
          height: 10,
          borderRadius: 5,
          overflow: 'hidden',
          flexDirection: 'row',
          backgroundColor: 'rgba(107, 122, 144, 0.15)',
        }}
      >
        <View style={{ width: `${presentPct}%`, backgroundColor: colors.success }} />
        <View style={{ width: `${absentPct}%`, backgroundColor: colors.danger }} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          {present} present · {absent} absent
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          {left == null ? 'No session limit' : left === 0 ? 'Sessions complete' : `${left} left`}
        </Text>
      </View>
    </View>
  );
}

export default function Reports() {
  const { classes } = useClasses();
  const { getStudentsByClass } = useStudents();
  const { records, getRecordForClassDate } = useAttendance();

  const [dateKey, setDateKey] = useState(todayKey());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const activeClasses = classes.filter((c) => c.isActive);
  const selectedClass =
    activeClasses.find((c) => c.id === selectedClassId) || activeClasses[0] || null;
  const classStudents = selectedClass ? getStudentsByClass(selectedClass.id) : [];
  const dayRecord = selectedClass ? getRecordForClassDate(selectedClass.id, dateKey) : null;

  function handleDateChange(event, selectedDate) {
    setShowPicker(false);
    if (selectedDate) {
      setDateKey(toDateKey(selectedDate));
    }
  }

  // Summary tiles for the selected date
  const classStats = activeClasses.map((c) => {
    const record = getRecordForClassDate(c.id, dateKey);
    if (!record) return { marked: false, percent: null };
    const total = record.records.length;
    const present = record.records.filter((r) => r.status === 'present').length;
    return { marked: true, percent: total ? Math.round((present / total) * 100) : null };
  });
  const markedClasses = classStats.filter((s) => s.marked);
  // Classes with no session that day have no percentage, so leave them out of the average.
  const counted = classStats.filter((s) => s.percent != null);
  const overallPercent = counted.length
    ? Math.round(counted.reduce((sum, s) => sum + s.percent, 0) / counted.length)
    : null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={screenTitleStyle}>Reports</Text>
        <Text style={screenSubtitleStyle}>Attendance and sessions</Text>

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

        {/* Student sessions */}
        <SectionTitle>Student Sessions</SectionTitle>

        {activeClasses.length === 0 ? (
          <View style={[cardStyle, { padding: 24, alignItems: 'center' }]}>
            <Text style={{ fontSize: 14, textAlign: 'center', color: colors.muted }}>
              No active classes yet. Add one from the Classes tab to get started.
            </Text>
          </View>
        ) : (
          <>
            {/* Class chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}
            >
              {activeClasses.map((c) => {
                const selected = c.id === selectedClass?.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedClassId(c.id)}
                    style={{
                      height: 38,
                      paddingHorizontal: 18,
                      borderRadius: 19,
                      justifyContent: 'center',
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary : colors.card,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: selected ? '#FFFFFF' : colors.text,
                      }}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Legend color={colors.success} label="Present" />
              <Legend color={colors.danger} label="Absent" />
              <Legend color="rgba(107, 122, 144, 0.35)" label="Left" />
            </View>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 14 }}>
              Bars cover all sessions so far. The badge shows each student on{' '}
              {formatDisplayDate(dateKey)}.
            </Text>

            {classStudents.length === 0 ? (
              <View style={[cardStyle, { padding: 24, alignItems: 'center' }]}>
                <Text style={{ fontSize: 14, textAlign: 'center', color: colors.muted }}>
                  This class has no students yet.
                </Text>
              </View>
            ) : (
              classStudents.map((student) => {
                let dayStatus = null;
                if (dayRecord) {
                  dayStatus =
                    dayRecord.records.find((r) => r.studentId === student.id)?.status || 'none';
                }
                return (
                  <StudentSessionCard
                    key={student.id}
                    student={student}
                    stats={getStudentSessionStats(student.id, records)}
                    dayStatus={dayStatus}
                  />
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}