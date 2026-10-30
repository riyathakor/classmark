import { getItem, setItem } from './asyncStorageHelpers';
import { STORAGE_KEYS } from './storageKeys';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getAllStudents() {
  return getItem(STORAGE_KEYS.STUDENTS, []);
}

export async function getStudentsByClass(classId) {
  const all = await getAllStudents();
  return all
    .filter((s) => s.classId === classId)
    .sort((a, b) => a.rollNumber - b.rollNumber);
}

async function getNextRollNumber(classId) {
  const classStudents = await getStudentsByClass(classId);
  if (classStudents.length === 0) return 1;
  return Math.max(...classStudents.map((s) => s.rollNumber)) + 1;
}

export async function addStudent(classId, name, monthlyFee) {
  const all = await getAllStudents();
  const rollNumber = await getNextRollNumber(classId);
  const newStudent = {
    id: generateId(),
    classId,
    name: name.trim(),
    rollNumber,
    monthlyFee,
    createdAt: new Date().toISOString(),
  };
  await setItem(STORAGE_KEYS.STUDENTS, [...all, newStudent]);
  return newStudent;
}

export async function updateStudent(id, name, monthlyFee) {
  const all = await getAllStudents();
  const updated = all.map((s) =>
    s.id === id ? { ...s, name: name.trim(), monthlyFee } : s
  );
  await setItem(STORAGE_KEYS.STUDENTS, updated);
  return updated;
}

export async function removeStudent(id) {
  const all = await getAllStudents();
  const updated = all.filter((s) => s.id !== id);
  await setItem(STORAGE_KEYS.STUDENTS, updated);
  return updated;
}