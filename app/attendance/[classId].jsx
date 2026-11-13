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
import { todayKey, formatDisplayDate, dateKeyToDateObj, toDateKey } from '../../src/utils/date';

function StatusButton({ label, selected, selectedColor, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                height: 34,
                paddingHorizontal: 14,
                borderRadius: 17,
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
    const { getRecordForClassDate, saveAttendance } = useAttendance();
    const insets = useSafeAreaInsets();

    const classItem = classes.find((c) => c.id === classId);
    const students = getStudentsByClass(classId);

    const [dateKey, setDateKey] = useState(todayKey());
    const [showPicker, setShowPicker] = useState(false);
    const [statuses, setStatuses] = useState({});

    const existingRecord = getRecordForClassDate(classId, dateKey);
    const isEditMode = !!existingRecord;

    useEffect(() => {
        if (existingRecord) {
            const map = {};
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

    function markAllPresent() {
        const map = {};
        students.forEach((s) => {
            map[s.id] = 'present';
        });
        setStatuses(map);
    }

    async function handleSubmit() {
        const unmarked = students.filter((s) => !statuses[s.id]);
        if (unmarked.length > 0) {
            Alert.alert(
                'Incomplete attendance',
                `Please mark a status for all students. ${unmarked.length} student(s) unmarked.`
            );
            return;
        }

        const studentStatuses = students.map((s) => ({
            studentId: s.id,
            status: statuses[s.id],
        }));

        await saveAttendance(classId, dateKey, studentStatuses);
        Alert.alert(
            'Saved',
            isEditMode ? 'Attendance updated successfully.' : 'Attendance submitted successfully.',
            [{ text: 'OK', onPress: () => router.back() }]
        );
    }

    function renderStudent({ item }) {
        const status = statuses[item.id];
        return (
            <View
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
                            {item.rollNumber}
                        </Text>
                    </View>
                    <Text
                        numberOfLines={1}
                        style={{ flex: 1, fontSize: 16, fontWeight: '600', color: colors.text }}
                    >
                        {item.name}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
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
                </View>
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

                {/* Mark all present */}
                <Pressable
                    onPress={markAllPresent}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: CHIP,
                        marginBottom: 14,
                    }}
                >
                    <Ionicons name="checkmark-done" size={18} color={colors.text} />
                    <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '700', color: colors.text }}>
                        Mark All Present
                    </Text>
                </Pressable>

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