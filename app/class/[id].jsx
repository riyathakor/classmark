import { useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useClasses } from '../../src/context/ClassContext';
import { useStudents } from '../../src/context/StudentContext';
import { usePayments } from '../../src/context/PaymentContext';
import { useAttendance } from '../../src/context/AttendanceContext';
import StudentFormModal from '../../src/components/StudentFormModal';
import Button from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { cardStyle, CHIP } from '../../src/theme/ui';
import { formatMoney, getStudentFee, currentMonthKey } from '../../src/utils/fees';
import { getSessionsUsed } from '../../src/utils/sessions';

export default function ClassDetail() {
  const { id } = useLocalSearchParams();
  const { classes } = useClasses();
  const { getStudentsByClass, addStudent, updateStudent, removeStudent } = useStudents();
  const { getPayment } = usePayments();
  const { records } = useAttendance();
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const classItem = classes.find((c) => c.id === id);
  const students = getStudentsByClass(id);
  const month = currentMonthKey();

  function openAddModal() {
    setEditingStudent(null);
    setModalVisible(true);
  }

  function openEditModal(student) {
    setEditingStudent(student);
    setModalVisible(true);
  }

  async function handleSubmit(name, monthlyFee, totalSessions) {
    if (editingStudent) {
      await updateStudent(editingStudent.id, name, monthlyFee, totalSessions);
    } else {
      await addStudent(id, name, monthlyFee, totalSessions);
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
    const paid = !!getPayment(item.id, month);
    const used = getSessionsUsed(item.id, records);
    const sessionsSet = item.totalSessions != null;

    return (
      <View
        style={[
          cardStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            marginBottom: 12,
          },
        ]}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 8 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: CHIP,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
              {item.rollNumber}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              {item.name}
            </Text>
            <Text style={{ fontSize: 13, marginTop: 2, color: colors.muted }}>
              {formatMoney(getStudentFee(item))} / month
            </Text>
            <Text
              style={{
                fontSize: 13,
                marginTop: 1,
                color: sessionsSet ? colors.muted : colors.danger,
              }}
            >
              {sessionsSet
                ? `${used}/${item.totalSessions} sessions used`
                : 'Total sessions not set'}
            </Text>
            <View
              style={{
                alignSelf: 'flex-start',
                marginTop: 6,
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 10,
                backgroundColor: paid ? 'rgba(31, 160, 82, 0.12)' : 'rgba(217, 54, 54, 0.10)',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: paid ? colors.success : colors.danger,
                }}
              >
                {paid ? 'Paid this month' : 'Unpaid this month'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => openEditModal(item)}
            hitSlop={6}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: CHIP,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="create-outline" size={18} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => handleRemove(item)}
            hitSlop={6}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(217, 54, 54, 0.10)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: classItem?.name || 'Class',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { fontSize: 18, fontWeight: '700', color: colors.text },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: CHIP,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <Button label="+ Add Student" onPress={openAddModal} />

        <Pressable
          onPress={() => router.push(`/fees/${id}`)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 42,
            borderRadius: 21,
            backgroundColor: CHIP,
            marginTop: 12,
            marginBottom: 16,
          }}
        >
          <Ionicons name="wallet" size={18} color={colors.text} />
          <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '700', color: colors.text }}>
            Collect Fees
          </Text>
        </Pressable>

        <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>
          {students.length} {students.length === 1 ? 'student' : 'students'}
        </Text>

        {students.length === 0 ? (
          <View style={[cardStyle, { padding: 24, alignItems: 'center' }]}>
            <Text style={{ fontSize: 14, textAlign: 'center', color: colors.muted }}>
              No students yet. Tap "Add Student" to add your first one.
            </Text>
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          />
        )}
      </View>

      <StudentFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        student={editingStudent}
        sessionsUsed={editingStudent ? getSessionsUsed(editingStudent.id, records) : 0}
      />
    </View>
  );
}