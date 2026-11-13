import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useClasses } from '../../src/context/ClassContext';
import { useStudents } from '../../src/context/StudentContext';
import { usePayments } from '../../src/context/PaymentContext';
import StatBar from '../../src/components/StatBar';
import StatCard from '../../src/components/StatCard';
import SectionTitle from '../../src/components/SectionTitle';
import { colors } from '../../src/theme/colors';
import { cardStyle, CHIP, LABEL, screenTitleStyle, screenSubtitleStyle } from '../../src/theme/ui';
import { currentMonthKey, formatMonth, shiftMonth, formatMoney } from '../../src/utils/fees';
import { getMonthSummary, getTotalIncome } from '../../src/utils/finance';

const MASK = '₹ XX,XXX';

// A money tile whose figure is revealed with its own eye icon.
function MoneyTile({ label, amount, valueColor }) {
    const [hidden, setHidden] = useState(true);

    return (
        <View style={[cardStyle, { flex: 1, height: 80, paddingHorizontal: 16, paddingTop: 12 }]}>
            <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={{ fontSize: 24, lineHeight: 32, fontWeight: '700', color: valueColor }}
            >
                {hidden ? MASK : formatMoney(amount)}
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 1,
                }}
            >
                <Text style={{ fontSize: 13, color: LABEL }}>{label}</Text>
                <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
                    <Ionicons
                        name={hidden ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={colors.muted}
                    />
                </Pressable>
            </View>
        </View>
    );
}

// Round arrow button used by the month selector.
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

export default function Finance() {
    const { classes } = useClasses();
    const { students } = useStudents();
    const { payments } = usePayments();

    const [month, setMonth] = useState(currentMonthKey());
    const [classAmountsHidden, setClassAmountsHidden] = useState(true);
    const isCurrentMonth = month === currentMonthKey();

    const summary = getMonthSummary(classes, students, payments, month);
    const totalIncome = getTotalIncome(payments);

    const classMoney = (amount) => (classAmountsHidden ? MASK : formatMoney(amount));

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface }}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={screenTitleStyle}>Finance</Text>
                <Text style={screenSubtitleStyle}>Income and fee collection</Text>

                {/* Month selector */}
                <View
                    style={[
                        cardStyle,
                        {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 12,
                            marginTop: 24,
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

                {/* Summary tiles */}
                <View style={{ flexDirection: 'row', gap: 14, marginTop: 14 }}>
                    <MoneyTile label="Collected" amount={summary.collected} valueColor={colors.success} />
                    <MoneyTile label="Pending" amount={summary.pending} valueColor={colors.danger} />
                </View>
                <View style={{ flexDirection: 'row', gap: 14, marginTop: 14 }}>
                    <StatCard
                        value={`${summary.paidCount}/${summary.studentCount}`}
                        label="Students Paid"
                        icon="people"
                        iconColor={colors.text}
                        valueColor={colors.text}
                    />
                    <MoneyTile label="Total Income" amount={totalIncome} valueColor={colors.text} />
                </View>

                {/* Class-wise breakdown */}
                <SectionTitle
                    right={
                        <Pressable
                            onPress={() => setClassAmountsHidden((h) => !h)}
                            hitSlop={8}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: CHIP,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Ionicons
                                name={classAmountsHidden ? 'eye-off-outline' : 'eye-outline'}
                                size={19}
                                color={colors.text}
                            />
                        </Pressable>
                    }
                >
                    Class-wise Income
                </SectionTitle>
                <Text style={{ fontSize: 13, color: colors.muted, marginTop: -6, marginBottom: 12 }}>
                    Tap a class to record payments
                </Text>

                {summary.rows.length === 0 ? (
                    <View style={[cardStyle, { padding: 24, alignItems: 'center' }]}>
                        <Text style={{ fontSize: 14, textAlign: 'center', color: colors.muted }}>
                            No classes yet. Add a class and its students from the Classes tab.
                        </Text>
                    </View>
                ) : (
                    <View style={[cardStyle, { padding: 18, paddingBottom: 6 }]}>
                        {summary.rows.map((row) => (
                            <Pressable
                                key={row.classItem.id}
                                onPress={() => router.push(`/fees/${row.classItem.id}?month=${month}`)}
                            >
                                <StatBar
                                    label={row.classItem.name}
                                    percent={row.percent}
                                    subtitle={
                                        row.studentCount === 0 && row.collected === 0
                                            ? 'No students yet'
                                            : `${classMoney(row.collected)} of ${classMoney(row.due)} · ${row.paidCount}/${row.studentCount} paid`
                                    }
                                />
                            </Pressable>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}