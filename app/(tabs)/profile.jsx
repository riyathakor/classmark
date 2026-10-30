import { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { changePassword } from '../../src/storage/teacherStorage';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';

export default function Profile() {
  const { teacher, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  async function handleChangePassword() {
    setMessage('');
    setError('');
    if (!oldPassword || !newPassword) {
      setError('Please fill in both fields');
      return;
    }
    setLoading(true);
    const result = await changePassword(oldPassword, newPassword);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setOldPassword('');
    setNewPassword('');
    setMessage('Password updated successfully');
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="mb-4 text-2xl font-bold text-text">Profile</Text>

        <View className="mb-6 rounded-xl border border-border bg-card p-4">
          <Text className="text-lg font-semibold text-text">{teacher?.name}</Text>
          <Text className="text-sm text-muted">{teacher?.email}</Text>
          <Text className="mt-1 text-sm text-muted">{teacher?.designation}</Text>
          {/* Profile picture + edit-info fields will be added in a later stage */}
        </View>

        <Text className="mb-2 text-base font-semibold text-text">Change Password</Text>
        <Input
          label="Current password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
        />
        <Input
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        {error ? <Text className="mb-2 text-sm text-danger">{error}</Text> : null}
        {message ? <Text className="mb-2 text-sm text-success">{message}</Text> : null}
        <Button label="Update Password" onPress={handleChangePassword} loading={loading} variant="secondary" />

        <View className="mt-8">
          <Button
            label="Log Out"
            onPress={() =>
              Alert.alert('Log out', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log out', style: 'destructive', onPress: handleLogout },
              ])
            }
            variant="danger"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
