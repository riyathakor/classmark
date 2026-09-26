import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme/colors';

export default function Index() {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={isLoggedIn ? '/(tabs)/home' : '/login'} />;
}
