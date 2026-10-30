import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useClasses } from '../../src/context/ClassContext';
import { useStudents } from '../../src/context/StudentContext';
import { usePayments } from '../../src/context/PaymentContext';
import StatBar from '../../src/components/StatBar';
import { colors } from '../../src/theme/colors';
import { currentMonthKey, formatMonth, shiftMonth, formatMoney } from '../../src/utils/fees';
import { getMonthSummary, getTotalIncome } from '../../src/utils/finance';

export default function Finance() {
    const { classes } = useClasses();
    const { students } = useStudents();
    const { payments } = usePayments();

    const [month, setMonth] = useState(currentMonthKey());
    const isCurrentMonth = month === currentMonthKey();

    const summary = getMonthSummary(classes, students, payments, month);
    const totalIncome = getTotalIncome(payments);

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                <Text className="mb-4 text-2xl font-bold text-text">Finance</Text>

                {/* Month selector */}
                <View className="mb-4 flex-row items-center justify-between rounded-xl border border-border bg-card p-3">
                    <Pressable onPress={() => setMonth(shiftMonth(month, -1))} hitSlop={10}>
                        <Ionicons name="chevron-back" size={24} color={colors.primary} />
                    </Pressable>
                    <Text className="text-base font-semibold text-text">{formatMonth(month)}</Text>
                    <Pressable
                        onPress={() => setMonth(shiftMonth(month, 1))}
                        disabled={isCurrentMonth}
                        hitSlop={10}
                    >
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color={isCurrentMonth ? colors.border : colors.primary}
                        />
                    </Pressable>
                </View>

                {/* Summary tiles */}
                <View className="flex-row gap-3">
                    <View className="flex-1 rounded-xl border border-border bg-card p-4">
                        <Text className="text-2xl font-bold text-success">{formatMoney(summary.collected)}</Text>
                        <Text className="mt-1 text-xs text-muted">Collected</Text>
                    </View>
                    <View className="flex-1 rounded-xl border border-border bg-card p-4">
                        <Text className="text-2xl font-bold text-danger">{formatMoney(summary.pending)}</Text>
                        <Text className="mt-1 text-xs text-muted">Pending</Text>
                    </View>
                </View>

                <View className="mt-3 flex-row gap-3">
                    <View className="flex-1 rounded-xl border border-border bg-card p-4">
                        <Text className="text-2xl font-bold text-text">
                            {summary.paidCount}/{summary.studentCount}
                        </Text>
                        <Text className="mt-1 text-xs text-muted">Students Paid</Text>
                    </View>
                    <View className="flex-1 rounded-xl border border-border bg-card p-4">
                        <Text className="text-2xl font-bold text-text">{formatMoney(totalIncome)}</Text>
                        <Text className="mt-1 text-xs text-muted">Total Income (all time)</Text>
                    </View>
                </View>

                {/* Class-wise breakdown */}
                <Text className="mb-3 mt-6 text-lg font-bold text-text">Class-wise Income</Text>

                {summary.rows.length === 0 ? (
                    <View className="items-center rounded-xl border border-border bg-card p-6">
                        <Text className="text-center text-sm text-muted">
                            No classes yet. Add a class and its students from the Classes tab.
                        </Text>
                    </View>
                ) : (
                    <View className="rounded-xl border border-border bg-card p-4">
                        {summary.rows.map((row) => (
                            <StatBar
                                key={row.classItem.id}
                                label={row.classItem.name}
                                percent={row.percent}
                                subtitle={
                                    row.studentCount === 0 && row.collected === 0
                                        ? 'No students yet'
                                        : `${formatMoney(row.collected)} of ${formatMoney(row.due)} · ${row.paidCount}/${row.studentCount} paid`
                                }
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}