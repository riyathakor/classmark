import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useClasses } from '../../src/context/ClassContext';
import { useStudents } from '../../src/context/StudentContext';
import { useAttendance } from '../../src/context/AttendanceContext';
import Button from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { todayKey, formatDisplayDate, dateKeyToDateObj, toDateKey } from '../../src/utils/date';

export default function MarkAttendance() {
    const { classId } = useLocalSearchParams();
    const { classes } = useClasses();
    const { getStudentsByClass } = useStudents();
    const { getRecordForClassDate, saveAttendance } = useAttendance();

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
            <View className="mb-3 flex-row items-center justify-between rounded-xl border border-border bg-card p-4">
                <View className="flex-1 flex-row items-center gap-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-surface">
                        <Text className="text-xs font-semibold text-muted">{item.rollNumber}</Text>
                    </View>
                    <Text className="text-base font-medium text-text">{item.name}</Text>
                </View>

                <View className="flex-row gap-2">
                    <Pressable
                        onPress={() => setStatus(item.id, 'present')}
                        className={`rounded-lg px-3 py-2 ${status === 'present' ? 'bg-success' : 'bg-surface border border-border'
                            }`}
                    >
                        <Text className={status === 'present' ? 'text-xs font-semibold text-white' : 'text-xs text-muted'}>
                            Present
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setStatus(item.id, 'absent')}
                        className={`rounded-lg px-3 py-2 ${status === 'absent' ? 'bg-danger' : 'bg-surface border border-border'
                            }`}
                    >
                        <Text className={status === 'absent' ? 'text-xs font-semibold text-white' : 'text-xs text-muted'}>
                            Absent
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: classItem?.name || 'Mark Attendance',
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-2">
                            <Ionicons name="chevron-back" size={24} color={colors.text} />
                        </Pressable>
                    ),
                }}
            />

            <View className="flex-1 px-6 pt-4">
                <Pressable
                    onPress={() => setShowPicker(true)}
                    className="mb-3 flex-row items-center justify-between rounded-xl border border-border bg-card p-4"
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

                {isEditMode ? (
                    <View className="mb-3 rounded-lg bg-primary/10 px-3 py-2">
                        <Text className="text-xs text-primary">
                            Attendance already submitted for this date — editing existing record.
                        </Text>
                    </View>
                ) : null}

                <View className="mb-3">
                    <Button label="Mark All Present" onPress={markAllPresent} variant="secondary" size="sm" />
                </View>

                {students.length === 0 ? (
                    <View className="mt-10 items-center">
                        <Text className="text-center text-base text-muted">
                            This class has no students yet. Add students from the Classes tab first.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={students}
                        keyExtractor={(item) => item.id}
                        renderItem={renderStudent}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 90 }}
                    />
                )}
            </View>

            {students.length > 0 ? (
                <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface px-6 pb-6 pt-3">
                    <Button label={isEditMode ? 'Update Attendance' : 'Submit Attendance'} onPress={handleSubmit} />
                </View>
            ) : null}
        </SafeAreaView>
    );
}