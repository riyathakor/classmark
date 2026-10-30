import { useEffect, useState } from 'react';
import { Modal, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import Input from './Input';
import Button from './Button';
import { getStudentFee } from '../utils/fees';

export default function StudentFormModal({ visible, onClose, onSubmit, student = null }) {
  const [name, setName] = useState('');
  const [fee, setFee] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      setName(student?.name || '');
      // Students saved before fees existed show an empty field until a fee is entered.
      const existingFee = student ? getStudentFee(student) : 0;
      setFee(student && existingFee > 0 ? String(existingFee) : '');
      setErrors({});
    }
  }, [visible, student]);

  function handleSubmit() {
    const next = {};
    if (!name.trim()) next.name = 'Student name is required';

    const feeNumber = Number(fee);
    if (fee.trim() === '' || Number.isNaN(feeNumber) || feeNumber < 0) {
      next.fee = 'Enter a valid monthly fee';
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit(name.trim(), feeNumber);
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
            error={errors.name}
          />

          <Input
            label="Monthly fee"
            value={fee}
            onChangeText={setFee}
            placeholder="e.g. 1500"
            keyboardType="numeric"
            error={errors.fee}
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