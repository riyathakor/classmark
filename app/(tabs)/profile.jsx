import { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { changePassword } from '../../src/storage/teacherStorage';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import SectionTitle from '../../src/components/SectionTitle';
import { colors } from '../../src/theme/colors';
import { cardStyle, CHIP, screenTitleStyle, screenSubtitleStyle } from '../../src/theme/ui';

export default function Profile() {
  const { teacher, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const initial = (teacher?.name || '').charAt(0).toUpperCase();

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
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={screenTitleStyle}>Profile</Text>
        <Text style={screenSubtitleStyle}>Your account and security</Text>

        {/* Profile card */}
        <View
          style={[
            cardStyle,
            { flexDirection: 'row', alignItems: 'center', padding: 18, marginTop: 24 },
          ]}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: CHIP,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text }}>{initial}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
              {teacher?.name}
            </Text>
            <Text style={{ fontSize: 14, marginTop: 2, color: colors.muted }}>{teacher?.email}</Text>
            {teacher?.designation ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 10,
                  backgroundColor: CHIP,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                  {teacher.designation}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Change password */}
        <SectionTitle>Change Password</SectionTitle>
        <View style={[cardStyle, { padding: 18, paddingBottom: 18 }]}>
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
          {error ? (
            <Text style={{ fontSize: 14, marginBottom: 10, color: colors.danger }}>{error}</Text>
          ) : null}
          {message ? (
            <Text style={{ fontSize: 14, marginBottom: 10, color: colors.success }}>{message}</Text>
          ) : null}
          <Button
            label="Update Password"
            onPress={handleChangePassword}
            loading={loading}
            variant="secondary"
          />
        </View>

        {/* Log out */}
        <View style={{ marginTop: 28 }}>
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