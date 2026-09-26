import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

/**
 * Shared Input used everywhere in ClassMark.
 * Supports labels, error messages, and a secure-text-entry toggle
 * (for password fields).
 */
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
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View className="mb-4 w-full">
      {label ? (
        <Text className="mb-1 text-sm font-medium text-text">{label}</Text>
      ) : null}

      <View
        className={`flex-row items-center rounded-xl border bg-white px-3 ${
          error ? 'border-danger' : 'border-border'
        } ${!editable ? 'opacity-60' : ''}`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          className="flex-1 py-3 text-base text-text"
        />

        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
    </View>
  );
}
