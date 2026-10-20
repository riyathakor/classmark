import { Pressable, Text, ActivityIndicator } from 'react-native';

/**
 * Shared Button used everywhere in ClassMark.
 *
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
}) {
  const base = 'rounded-xl items-center justify-center flex-row';

  const sizeClasses = {
    sm: 'py-2 px-3',
    md: 'py-3 px-4',
    lg: 'py-4 px-5',
  }[size];

  const variantClasses = {
    primary: 'bg-[#2C394D] active:bg-[#2E3E58]',
    secondary: 'bg-white border border-border active:bg-surface',
    danger: 'bg-danger active:bg-red-700',
    ghost: 'bg-transparent',
  }[variant];

  const textClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-text font-semibold',
    danger: 'text-white font-semibold',
    ghost: 'text-primary font-semibold',
  }[variant];

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${sizeClasses} ${variantClasses} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50' : ''
        }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : '#2C394D'} />
      ) : (
        <Text className={`${textClasses} ${textSize}`}>{label}</Text>
      )}
    </Pressable>
  );
}
