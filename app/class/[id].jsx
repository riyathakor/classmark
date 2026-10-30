import { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClasses } from '../../src/context/ClassContext';
import { useStudents } from '../../src/context/StudentContext';
import StudentFormModal from '../../src/components/StudentFormModal';
import Button from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { formatMoney, getStudentFee } from '../../src/utils/fees';

export default function ClassDetail() {
  const { id } = useLocalSearchParams();
  const { classes } = useClasses();
  const { getStudentsByClass, addStudent, updateStudent, removeStudent } = useStudents();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const classItem = classes.find((c) => c.id === id);
  const students = getStudentsByClass(id);

  function openAddModal() {
    setEditingStudent(null);
    setModalVisible(true);
  }

  function openEditModal(student) {
    setEditingStudent(student);
    setModalVisible(true);
  }

  async function handleSubmit(name, monthlyFee) {
    if (editingStudent) {
      await updateStudent(editingStudent.id, name, monthlyFee);
    } else {
      await addStudent(id, name, monthlyFee);
    }
    setModalVisible(false);
  }

  function handleRemove(student) {
    Alert.alert(
      'Remove student',
      `Remove ${student.name} from this class? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeStudent(student.id) },
      ]
    );
  }

  function renderCard({ item }) {
    return (
      <View className="mb-3 flex-row items-center justify-between rounded-xl border border-border bg-card p-4">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-surface">
            <Text className="text-xs font-semibold text-muted">{item.rollNumber}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-text">{item.name}</Text>
            <Text className="text-xs text-muted">{formatMoney(getStudentFee(item))} / month</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => openEditModal(item)} hitSlop={8}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => handleRemove(item)} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <Stack.Screen
        options={{
          headerShown: true,
          title: classItem?.name || 'Class',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8} className="mr-2">
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      <View className="flex-1 px-6 pt-4">
        <View className="mb-4">
          <Button label="+ Add Student" onPress={openAddModal} />
        </View>

        {students.length === 0 ? (
          <View className="mt-10 items-center">
            <Text className="text-base text-muted">
              No students yet. Tap "Add Student" to add your first one.
            </Text>
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <StudentFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        student={editingStudent}
      />
    </SafeAreaView>
  );
}