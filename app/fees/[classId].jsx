import { useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useClasses } from '../../src/context/ClassContext';
import { useStudents } from '../../src/context/StudentContext';
import { usePayments } from '../../src/context/PaymentContext';
import { colors } from '../../src/theme/colors';
import { cardStyle, CHIP, LABEL } from '../../src/theme/ui';
import {
    currentMonthKey,
    formatMonth,
    shiftMonth,
    formatMoney,
    getStudentFee,
} from '../../src/utils/fees';
import { formatDisplayDate } from '../../src/utils/date';

// Small summary tile (three sit side by side).
function MiniStat({ value, label, color }) {
    return (
        <View style={[cardStyle, { flex: 1, paddingVertical: 12, paddingHorizontal: 14 }]}>
            <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={{ fontSize: 20, fontWeight: '700', color }}
            >
                {value}
            </Text>
            <Text style={{ fontSize: 12, marginTop: 2, color: LABEL }}>{label}</Text>
        </View>
    );
}

// Round arrow button for the month selector.
function ArrowButton({ icon, onPress, disabled = false }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            hitSlop={8}
            style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: disabled ? 'rgba(107, 122, 144, 0.10)' : CHIP,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Ionicons name={icon} size={20} color={disabled ? colors.border : colors.text} />
        </Pressable>
    );
}

export default function ClassFees() {
    const { classId, month: monthParam } = useLocalSearchParams();
    const { classes } = useClasses();
    const { getStudentsByClass } = useStudents();
    const { getPayment, markPaid, undoPayment } = usePayments();
    const insets = useSafeAreaInsets();

    const classItem = classes.find((c) => c.id === classId);
    const students = getStudentsByClass(classId);

    const [month, setMonth] = useState(monthParam || currentMonthKey());
    const isCurrentMonth = month === currentMonthKey();

    let collected = 0;
    let pending = 0;
    let paidCount = 0;
    students.forEach((s) => {
        const payment = getPayment(s.id, month);
        if (payment) {
            collected += payment.amount;
            paidCount++;
        } else {
            pending += getStudentFee(s);
        }
    });

    function handleMarkPaid(student) {
        markPaid(student.id, classId, month, getStudentFee(student));
    }

    function handleUndo(student) {
        Alert.alert(
            'Undo payment',
            `Remove ${student.name}'s payment for ${formatMonth(month)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Undo', style: 'destructive', onPress: () => undoPayment(student.id, month) },
            ]
        );
    }

    function renderStudent({ item }) {
        const fee = getStudentFee(item);
        const payment = getPayment(item.id, month);

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
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            backgroundColor: CHIP,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }}
                    >
                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                            {item.rollNumber}
                        </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                            {item.name}
                        </Text>
                        {payment ? (
                            <Text style={{ fontSize: 12, marginTop: 2, color: colors.success }}>
                                Paid {formatMoney(payment.amount)} · {formatDisplayDate(payment.paidOn)}
                            </Text>
                        ) : (
                            <Text style={{ fontSize: 12, marginTop: 2, color: colors.muted }}>
                                {fee > 0 ? `${formatMoney(fee)} due` : 'No fee set'}
                            </Text>
                        )}
                    </View>
                </View>

                {payment ? (
                    <Pressable
                        onPress={() => handleUndo(item)}
                        hitSlop={6}
                        style={{
                            height: 34,
                            paddingHorizontal: 14,
                            borderRadius: 17,
                            justifyContent: 'center',
                            backgroundColor: 'rgba(217, 54, 54, 0.10)',
                        }}
                    >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.danger }}>Undo</Text>
                    </Pressable>
                ) : fee > 0 ? (
                    <Pressable
                        onPress={() => handleMarkPaid(item)}
                        style={{
                            height: 34,
                            paddingHorizontal: 14,
                            borderRadius: 17,
                            justifyContent: 'center',
                            backgroundColor: CHIP,
                        }}
                    >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Mark paid</Text>
                    </Pressable>
                ) : null}
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: classItem ? `${classItem.name} · Fees` : 'Fees',
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
                {/* Month selector */}
                <View
                    style={[
                        cardStyle,
                        {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 12,
                            marginBottom: 12,
                        },
                    ]}
                >
                    <ArrowButton icon="chevron-back" onPress={() => setMonth(shiftMonth(month, -1))} />
                    <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
                        {formatMonth(month)}
                    </Text>
                    <ArrowButton
                        icon="chevron-forward"
                        onPress={() => setMonth(shiftMonth(month, 1))}
                        disabled={isCurrentMonth}
                    />
                </View>

                {/* Class summary for the month */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <MiniStat value={formatMoney(collected)} label="Collected" color={colors.success} />
                    <MiniStat value={formatMoney(pending)} label="Pending" color={colors.danger} />
                    <MiniStat value={`${paidCount}/${students.length}`} label="Paid" color={colors.text} />
                </View>

                {students.length === 0 ? (
                    <View style={[cardStyle, { padding: 24, alignItems: 'center' }]}>
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
                        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
                    />
                )}
            </View>
        </View>
    );
}