import { useState } from 'react';
import { View, Text, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import Input from '../src/components/Input';
import Button from '../src/components/Button';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password, rememberMe);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.replace('/(tabs)/home');
  }

  function handleForgotPassword() {
    // Simulated flow — no real backend/email exists.
    Alert.alert(
      'Reset link sent',
      'If an account exists with this email, a password reset link has been sent. (Simulated — no email is actually sent.)'
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-surface"
    >
      <View className="flex-1 justify-center pr-6 pl-6">
        <View className="mb-8">
          <Text className="mb-1 text-4xl font-bold text-cyan-700 text-center">ClassMark</Text>
          <Text className="mb-8 text-base text-muted text-center">
            Attendance made simple for your classes
          </Text>
        </View>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />

        {error ? <Text className="mb-3 text-sm text-danger">{error}</Text> : null}

        <Pressable
          onPress={() => setRememberMe((r) => !r)}
          className="mb-6 flex-row items-center"
        >
          <View
            className={`mr-2 h-5 w-5 items-center justify-center rounded border ${rememberMe ? 'border-cyan-600 bg-cyan-600' : 'border-border bg-white'
              }`}
          >
            {rememberMe ? <Text className="text-xs text-white">✓</Text> : null}
          </View>
          <Text className="text-sm text-text">Remember me</Text>
        </Pressable>

        <Button label="Log In" onPress={handleLogin} loading={loading} />

        <Pressable onPress={handleForgotPassword} className="mt-4 items-center">
          <Text className="text-sm text-cyan-600 underline">Forgot password?</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
