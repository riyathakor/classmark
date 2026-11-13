import { useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useClasses } from '../../src/context/ClassContext';
import ClassFormModal from '../../src/components/ClassFormModal';
import Button from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { cardStyle, CHIP, screenTitleStyle, screenSubtitleStyle } from '../../src/theme/ui';

export default function Classes() {
  const {
    classes,
    isLoading,
    addClass,
    updateClass,
    toggleClassActive,
    deleteClass,
  } = useClasses();
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

  function handleDelete(classItem) {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${classItem.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteClass(classItem.id);
          },
        },
      ]
    );
  }

  function renderCard({ item }) {
    return (
      <Pressable
        onPress={() => router.push(`/class/${item.id}`)}
        style={[
          cardStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            paddingLeft: 20,
            paddingRight: 12,
            marginBottom: 12,
            borderLeftWidth: 5,
            borderLeftColor: item.isActive ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{item.name}</Text>
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: 6,
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 10,
              backgroundColor: item.isActive
                ? 'rgba(31, 160, 82, 0.12)'
                : 'rgba(107, 122, 144, 0.14)',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: item.isActive ? colors.success : colors.muted,
              }}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Edit */}
          <Pressable
            onPress={() => openEditModal(item)}
            hitSlop={6}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: CHIP,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="create-outline"
              size={19}
              color={colors.text}
            />
          </Pressable>

          {/* Active / Inactive */}
          <Pressable
            onPress={() => toggleClassActive(item.id)}
            hitSlop={6}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: 'rgba(107, 122, 144, 0.14)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={item.isActive ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={colors.muted}
            />
          </Pressable>

          {/* Delete */}
          <Pressable
            onPress={() => handleDelete(item)}
            hitSlop={6}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: 'rgba(220, 53, 69, 0.10)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="trash-outline"
              size={19}
              color="#DC3545"
            />
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 36 }}>
        <Text style={screenTitleStyle}>Classes</Text>
        <Text style={screenSubtitleStyle}>
          {classes.length} {classes.length === 1 ? 'class' : 'classes'}
        </Text>

        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Button label="+ Add Class" onPress={openAddModal} />
        </View>

        {!isLoading && classes.length === 0 ? (
          <View style={[cardStyle, { padding: 24, alignItems: 'center' }]}>
            <Text style={{ fontSize: 14, textAlign: 'center', color: colors.muted }}>
              No classes yet. Tap "Add Class" to create your first one.
            </Text>
          </View>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
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