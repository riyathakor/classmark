import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useClasses } from '../../src/context/ClassContext';
import { useStudents } from '../../src/context/StudentContext';
import { useAttendance } from '../../src/context/AttendanceContext';
import Button from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { cardStyle, CHIP } from '../../src/theme/ui';
import { getSessionInfo } from '../../src/utils/sessions';
import { todayKey, formatDisplayDate, dateKeyToDateObj, toDateKey } from '../../src/utils/date';

function StatusButton({ label, selected, selectedColor, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                flex: 1,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? selectedColor : 'rgba(107, 122, 144, 0.10)',
            }}
        >
            <Text style={{ fontSize: 13, fontWeight: '700', color: selected ? '#FFFFFF' : colors.muted }}>
                {label}
            </Text>
        </Pressable>
    );
}

export default function MarkAttendance() {
    const { classId } = useLocalSearchParams();
    const { classes } = useClasses();
    const { getStudentsByClass } = useStudents();
    const { records, getRecordForClassDate, saveAttendance } = useAttendance();
    const insets = useSafeAreaInsets();

    const classItem = classes.find((c) => c.id === classId);
    const students = getStudentsByClass(classId);

    const [dateKey, setDateKey] = useState(todayKey());
    const [showPicker, setShowPicker] = useState(false);
    // statuses: { [studentId]: 'present' | 'absent' | 'none' }  ('none' = no session)
    const [statuses, setStatuses] = useState({});

    const existingRecord = getRecordForClassDate(classId, dateKey);
    const isEditMode = !!existingRecord;

    // Session counts for this date. The date being edited is excluded, so
    // editing a day never uses up extra sessions.
    const info = {};
    students.forEach((s) => {
        info[s.id] = getSessionInfo(s, records, dateKey);
    });

    useEffect(() => {
        if (existingRecord) {
            // Students missing from a saved record had no session that day.
            const map = {};
            students.forEach((s) => {
                map[s.id] = 'none';
            });
            existingRecord.records.forEach((r) => {
                map[r.studentId] = r.status;
            });
            setStatuses(map);
        } else {
            setStatuses({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateKey, classId, existingRecord?.id]);

    function handleDateChange(event, selectedDate) {
        setShowPicker(false);
        if (selectedDate) {
            setDateKey(toDateKey(selectedDate));
        }
    }

    function setStatus(studentId, status) {
        setStatuses((prev) => ({ ...prev, [studentId]: status }));
    }

    // Marks everyone who still has sessions as present. Students already set to
    // "No session" and students at their limit are left alone.
    function markAllPresent() {
        setStatuses((prev) => {
            const map = { ...prev };
            students.forEach((s) => {
                if (info[s.id].locked) return;
                if (prev[s.id] === 'none') return;
                map[s.id] = 'present';
            });
            return map;
        });
    }

    // For a date when nobody in the class has a session.
    function markAllNoSession() {
        setStatuses((prev) => {
            const map = { ...prev };
            students.forEach((s) => {
                if (info[s.id].locked) return;
                map[s.id] = 'none';
            });
            return map;
        });
    }

    async function handleSubmit() {
        const eligible = students.filter((s) => !info[s.id].locked);
        const unmarked = eligible.filter((s) => !statuses[s.id]);
        if (unmarked.length > 0) {
            Alert.alert(
                'Incomplete attendance',
                `Please choose Present, Absent or No session for every student. ${unmarked.length} student(s) unmarked.`
            );
            return;
        }

        const entries = eligible
            .filter((s) => statuses[s.id] === 'present' || statuses[s.id] === 'absent')
            .map((s) => ({ studentId: s.id, status: statuses[s.id] }));

        // Keep what was already saved for students who are now at their session limit.
        const preserved = existingRecord
            ? existingRecord.records.filter((r) =>
                students.some((s) => s.id === r.studentId && info[s.id].locked)
            )
            : [];

        // An empty list is fine: it records that nobody had a session on this date.
        const all = [...entries, ...preserved];

        await saveAttendance(classId, dateKey, all);
        Alert.alert(
            'Saved',
            all.length === 0
                ? 'Recorded: no session for this class on this date.'
                : isEditMode
                    ? 'Attendance updated successfully.'
                    : 'Attendance submitted successfully.',
            [{ text: 'OK', onPress: () => router.back() }]
        );

    }

    function renderStudent({ item }) {
        const { used, total, remaining, locked } = info[item.id];
        const status = statuses[item.id];
        const recorded = existingRecord?.records.find((r) => r.studentId === item.id)?.status;

        let subtitle = 'No session limit set';
        if (total != null) {
            subtitle = locked
                ? `${total}/${total} sessions used`
                : `${used}/${total} sessions used · ${remaining} left`;
        }

        return (
            <View style={[cardStyle, { padding: 14, marginBottom: 12 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                            {item.rollNumber}
                        </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                            {item.name}
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                marginTop: 1,
                                color: total != null && !locked && remaining <= 2 ? colors.danger : colors.muted,
                            }}
                        >
                            {subtitle}
                        </Text>
                    </View>

                    {locked ? (
                        <View
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 10,
                                backgroundColor: 'rgba(107, 122, 144, 0.14)',
                            }}
                        >
                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted }}>
                                Sessions complete
                            </Text>
                        </View>
                    ) : null}
                </View>

                {locked ? (
                    recorded ? (
                        <Text style={{ fontSize: 12, marginTop: 10, color: colors.muted }}>
                            Recorded on this date: {recorded === 'present' ? 'Present' : 'Absent'}
                        </Text>
                    ) : null
                ) : (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                        <StatusButton
                            label="Present"
                            selected={status === 'present'}
                            selectedColor={colors.success}
                            onPress={() => setStatus(item.id, 'present')}
                        />
                        <StatusButton
                            label="Absent"
                            selected={status === 'absent'}
                            selectedColor={colors.danger}
                            onPress={() => setStatus(item.id, 'absent')}
                        />
                        <StatusButton
                            label="No session"
                            selected={status === 'none'}
                            selectedColor={colors.muted}
                            onPress={() => setStatus(item.id, 'none')}
                        />
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: classItem?.name || 'Mark Attendance',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.surface },
                    headerTitleStyle: { fontSize: 18, fontWeight: '700', color: colors.text },
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            hitSlop={8}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: CHIP,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 8,
                            }}
                        >
                            <Ionicons name="chevron-back" size={20} color={colors.text} />
                        </Pressable>
                    ),
                }}
            />

            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
                {/* Date */}
                <Pressable
                    onPress={() => setShowPicker(true)}
                    style={[
                        cardStyle,
                        {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 14,
                            marginBottom: 12,
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

                {isEditMode ? (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 12,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            borderRadius: 14,
                            backgroundColor: CHIP,
                        }}
                    >
                        <Ionicons name="create-outline" size={16} color={colors.text} />
                        <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: colors.text }}>
                            Attendance already submitted for this date — editing existing record.
                        </Text>
                    </View>
                ) : null}

                {/* Quick actions */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                    <Pressable
                        onPress={markAllPresent}
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 42,
                            borderRadius: 21,
                            backgroundColor: CHIP,
                        }}
                    >
                        <Ionicons name="checkmark-done" size={17} color={colors.text} />
                        <Text style={{ marginLeft: 6, fontSize: 14, fontWeight: '700', color: colors.text }}>
                            All Present
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={markAllNoSession}
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 42,
                            borderRadius: 21,
                            backgroundColor: 'rgba(107, 122, 144, 0.14)',
                        }}
                    >
                        <Ionicons name="remove-circle-outline" size={17} color={colors.muted} />
                        <Text style={{ marginLeft: 6, fontSize: 14, fontWeight: '700', color: colors.muted }}>
                            All No Session
                        </Text>
                    </Pressable>
                </View>

                {students.length === 0 ? (
                    <View style={[cardStyle, { padding: 24, alignItems: 'center', marginTop: 8 }]}>
                        <Text style={{ fontSize: 14, textAlign: 'center', color: colors.muted }}>
                            This class has no students yet. Add students from the Classes tab first.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={students}
                        keyExtractor={(item) => item.id}
                        renderItem={renderStudent}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120 }}
                    />
                )}
            </View>

            {/* Sticky submit bar */}
            {students.length > 0 ? (
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: colors.card,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingHorizontal: 24,
                        paddingTop: 14,
                        paddingBottom: Math.max(insets.bottom, 16),
                        shadowColor: colors.primary,
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: -3 },
                        elevation: 12,
                    }}
                >
                    <Button
                        label={isEditMode ? 'Update Attendance' : 'Submit Attendance'}
                        onPress={handleSubmit}
                    />
                </View>
            ) : null}
        </View>
    );
}