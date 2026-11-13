import { View, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function SectionTitle({ children, right = null }) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 32,
                marginBottom: 14,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                    style={{
                        width: 5,
                        height: 26,
                        borderRadius: 3,
                        backgroundColor: colors.accent,
                        marginRight: 9,
                    }}
                />
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{children}</Text>
            </View>
            {right}
        </View>
    );
}