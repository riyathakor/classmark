import { View, Text } from 'react-native';
import { getBarColor } from '../utils/stats';

export default function StatBar({ label, subtitle, percent }) {
    const barColor = getBarColor(percent);
    const widthPercent = percent ?? 0;

    return (
        <View className="mb-4">
            <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-text">{label}</Text>
                <Text className="text-sm font-semibold text-text">
                    {percent == null ? '—' : `${percent}%`}
                </Text>
            </View>

            <View className="h-2.5 w-full overflow-hidden rounded-full bg-border">
                <View className={`h-full rounded-full ${barColor}`} style={{ width: `${widthPercent}%` }} />
            </View>

            {subtitle ? <Text className="mt-1 text-xs text-muted">{subtitle}</Text> : null}
        </View>
    );
}