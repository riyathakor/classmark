import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useClasses } from '../../src/context/ClassContext';
import { useStudents } from '../../src/context/StudentContext';
import { useAttendance } from '../../src/context/AttendanceContext';
import { colors } from '../../src/theme/colors';
import { todayKey } from '../../src/utils/date';

const PAGE_BG = '#FEFAF4'; // the warm cream in your screenshot
const LABEL = '#3F4E68';
const CHIP = 'rgba(244, 201, 93, 0.30)';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "Fri, 13 Nov, 2026" exactly like the design, whatever the phone's language.
function formatHeaderDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAYS[date.getDay()]}, ${d} ${MONTHS[m - 1]}, ${y}`;
}

const cardStyle = {
  backgroundColor: colors.card,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: '#263A56',
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
};

function StatCard({ value, label, icon, iconColor, valueColor }) {
  return (
    <View style={[cardStyle, { flex: 1, height: 86, paddingLeft: 17, paddingTop: 13 }]}>
      <Text style={{ fontSize: 32, lineHeight: 38, fontWeight: '700', color: valueColor }}>
        {value}
      </Text>
      <Text style={{ fontSize: 15, color: LABEL, marginTop: 1 }}>{label}</Text>
      <View
        style={{
          position: 'absolute',
          top: 13,
          right: 11,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: CHIP,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
    </View>
  );
}

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

  const firstName = teacher?.name?.split(' ')[0] || '';

  function renderClassRow({ classItem, record }) {
    const isSubmitted = !!record;
    const presentCount = record
      ? record.records.filter((r) => r.status === 'present').length
      : 0;

    return (
      <Pressable
        key={classItem.id}
        onPress={() => router.push(`/attendance/${classItem.id}`)}
        style={[
          cardStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            paddingLeft: 20,
            paddingRight: 12,
            marginBottom: 12,
            borderLeftWidth: 5,
            borderLeftColor: isSubmitted ? colors.success : colors.primary,
          },
        ]}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>
            {classItem.name}
          </Text>
          <Text
            style={{
              fontSize: 16,
              marginTop: 2,
              color: isSubmitted ? colors.success : colors.muted,
            }}
          >
            {isSubmitted
              ? `${presentCount}/${record.records.length} present`
              : 'Not marked yet'}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 37,
            paddingHorizontal: 17,
            borderRadius: 19,
            backgroundColor: isSubmitted ? 'rgba(31, 160, 82, 0.12)' : CHIP,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              marginRight: 4,
              color: isSubmitted ? colors.success : colors.text,
            }}
          >
            {isSubmitted ? 'Done' : 'Mark now'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isSubmitted ? colors.success : colors.text}
          />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: PAGE_BG }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>
              Welcome, {firstName} 🏓
            </Text>
            <Text style={{ fontSize: 16, marginTop: 4, color: colors.muted }}>
              {formatHeaderDate(today)}
            </Text>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 26 }}>
            <StatCard
              value={activeClasses.length}
              label="Active Classes"
              icon="calendar"
              iconColor={colors.text}
              valueColor={colors.text}
            />
            <StatCard
              value={students.length}
              label="Total Students"
              icon="people"
              iconColor={colors.text}
              valueColor={colors.text}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 14 }}>
            <StatCard
              value={submittedCount}
              label="Marked Today"
              icon="checkmark-circle"
              iconColor={colors.success}
              valueColor={colors.success}
            />
            <StatCard
              value={pendingCount}
              label="Pending Today"
              icon="time-outline"
              iconColor={colors.danger}
              valueColor={colors.danger}
            />
          </View>

          {/* Today's classes */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 36, marginBottom: 14 }}>
            <View
              style={{
                width: 5,
                height: 26,
                borderRadius: 3,
                backgroundColor: colors.accent,
                marginRight: 9,
              }}
            />
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>
              Today's Classes
            </Text>
          </View>

          {activeClasses.length === 0 ? (
            <View style={[cardStyle, { padding: 24, alignItems: 'center' }]}>
              <Text style={{ fontSize: 14, textAlign: 'center', color: colors.muted }}>
                No active classes yet. Add one from the Classes tab to get started.
              </Text>
            </View>
          ) : (
            todayStatusByClass.map(renderClassRow)
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}