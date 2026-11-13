import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cardStyle, CHIP, LABEL } from '../theme/ui';

export default function StatCard({ value, label, icon, iconColor, valueColor }) {
    return (
        <View style={[cardStyle, { flex: 1, height: 80, paddingLeft: 16, paddingTop: 12 }]}>
            <Text style={{ fontSize: 26, lineHeight: 32, fontWeight: '700', color: valueColor }}>
                {value}
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 13, color: LABEL, marginTop: 1 }}>
                {label}
            </Text>
            <View
                style={{
                    position: 'absolute',
                    top: 12,
                    right: 10,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: CHIP,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Ionicons name={icon} size={17} color={iconColor} />
            </View>
        </View>
    );
}