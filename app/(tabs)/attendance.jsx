import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useClasses } from '../../src/context/ClassContext';
import { useAttendance } from '../../src/context/AttendanceContext';
import { colors } from '../../src/theme/colors';
import { cardStyle, CHIP, screenTitleStyle, screenSubtitleStyle } from '../../src/theme/ui';
import { todayKey } from '../../src/utils/date';

export default function Attendance() {
  const { classes, isLoading } = useClasses();
  const { getRecordForClassDate } = useAttendance();
  const activeClasses = classes.filter((c) => c.isActive);
  const today = todayKey();

  function renderCard({ item }) {
    const record = getRecordForClassDate(item.id, today);
    const isSubmitted = !!record;
    const presentCount = record
      ? record.records.filter((r) => r.status === 'present').length
      : 0;

    return (
      <Pressable
        onPress={() => router.push(`/attendance/${item.id}`)}
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
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{item.name}</Text>
          <Text
            style={{
              fontSize: 14,
              marginTop: 3,
              color: isSubmitted ? colors.success : colors.muted,
            }}
          >
            {isSubmitted
              ? `${presentCount}/${record.records.length} present today`
              : 'Not marked today'}
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
            {isSubmitted ? 'Edit' : 'Mark now'}
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
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 36 }}>
        <Text style={screenTitleStyle}>Attendance</Text>
        <Text style={[screenSubtitleStyle, { marginBottom: 24 }]}>
          Choose a class to mark today's attendance
        </Text>

        {!isLoading && activeClasses.length === 0 ? (
          <View style={[cardStyle, { padding: 24, alignItems: 'center' }]}>
            <Text style={{ fontSize: 14, textAlign: 'center', color: colors.muted }}>
              No active classes yet. Add a class first from the Classes tab.
            </Text>
          </View>
        ) : (
          <FlatList
            data={activeClasses}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}