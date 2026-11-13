import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  multiline = false,
}) {
  const isPassword = secureTextEntry;
  const [visible, setVisible] = useState(false); // password fields only: true = show characters
  const hidePassword = isPassword && !visible;

  return (
    <View className="mb-4 w-full">
      {label ? <Text className="mb-1 text-sm font-medium text-text">{label}</Text> : null}

      <View
        className={`flex-row items-center rounded-xl border bg-white px-3 ${error ? 'border-danger' : 'border-border'
          } ${!editable ? 'opacity-60' : ''}`}
      >
        <TextInput
          // A new key makes React Native build a fresh native input when the
          // toggle flips, so show/hide always takes effect.
          key={isPassword ? (visible ? 'pw-visible' : 'pw-hidden') : 'plain'}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={hidePassword}
          keyboardType={keyboardType}
          autoCapitalize={isPassword ? 'none' : autoCapitalize}
          autoCorrect={isPassword ? false : undefined}
          editable={editable}
          multiline={multiline}
          className="flex-1 py-3 text-base text-text"
        />

        {isPassword ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            style={{ paddingLeft: 8, paddingVertical: 6 }}
          >
            <Ionicons
              name={visible ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
    </View>
  );
}