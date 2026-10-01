import { useEffect, useState } from 'react';
import { Modal, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import Input from './Input';
import Button from './Button';

export default function StudentFormModal({ visible, onClose, onSubmit, student = null }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName(student?.name || '');
      setError('');
    }
  }, [visible, student]);

  function handleSubmit() {
    if (!name.trim()) {
      setError('Student name is required');
      return;
    }
    onSubmit(name.trim());
  }

  const isEditMode = !!student;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center bg-black/40 px-6"
      >
        <View className="w-full rounded-2xl bg-white p-5">
          <Text className="mb-4 text-lg font-bold text-text">
            {isEditMode ? 'Edit Student' : 'Add Student'}
          </Text>

          {isEditMode ? (
            <Text className="mb-3 text-sm text-muted">Roll No. {student.rollNumber}</Text>
          ) : null}

          <Input
            label="Student name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Aarav Shah"
            error={error}
          />

          <View className="mt-2 flex-row gap-3">
            <View className="flex-1">
              <Button label="Cancel" onPress={onClose} variant="secondary" />
            </View>
            <View className="flex-1">
              <Button label={isEditMode ? 'Save' : 'Add'} onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}