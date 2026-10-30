import { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useClasses } from '../../src/context/ClassContext';
import ClassFormModal from '../../src/components/ClassFormModal';
import Button from '../../src/components/Button';
import { colors } from '../../src/theme/colors';

export default function Classes() {
  const { classes, isLoading, addClass, updateClass, toggleClassActive } = useClasses();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null); // null = add mode

  function openAddModal() {
    setEditingClass(null);
    setModalVisible(true);
  }

  function openEditModal(classItem) {
    setEditingClass(classItem);
    setModalVisible(true);
  }

  async function handleSubmit(name) {
    if (editingClass) {
      await updateClass(editingClass.id, name);
    } else {
      await addClass(name);
    }
    setModalVisible(false);
  }

  function renderCard({ item }) {
    return (
      <Pressable
        onPress={() => router.push(`/class/${item.id}`)}
        className="mb-3 flex-row items-center justify-between rounded-xl border border-border bg-card p-4"
      >
        <View className="flex-1">
          <Text className="text-base font-semibold text-text">{item.name}</Text>
          <Text className={`mt-1 text-xs ${item.isActive ? 'text-success' : 'text-muted'}`}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>

        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => openEditModal(item)} hitSlop={8}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => toggleClassActive(item.id)} hitSlop={8}>
            <Ionicons
              name={item.isActive ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.muted}
            />
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-6 pt-8">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-text">Classes</Text>
        </View>

        <View className="mb-4">
          <Button label="+ Add Class" onPress={openAddModal} />
        </View>

        {!isLoading && classes.length === 0 ? (
          <View className="mt-10 items-center">
            <Text className="text-base text-muted">
              No classes yet. Tap "Add Class" to create your first one.
            </Text>
          </View>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <ClassFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        classItem={editingClass}
      />
    </SafeAreaView>
  );
}