
import { getItem, setItem } from './asyncStorageHelpers';
import { STORAGE_KEYS } from './storageKeys';

export const DEFAULT_TEACHER = {
  name: 'Krunal Thakor',
  email: 'krunalthakor@gmail.com',
  password: 'Krunal@2310',
  profilePicture: null,
  designation: 'Table Tennis Coach',
};

export async function getTeacher() {
  const existing = await getItem(STORAGE_KEYS.TEACHER);

  if (existing) return existing;

  await setItem(STORAGE_KEYS.TEACHER, DEFAULT_TEACHER);
  return DEFAULT_TEACHER;
}

export async function updateTeacher(partial) {
  const current = await getTeacher();
  const updated = { ...current, ...partial };

  await setItem(STORAGE_KEYS.TEACHER, updated);
  return updated;
}

export async function verifyPassword(password) {
  const teacher = await getTeacher();
  return teacher.password === password;
}

export async function changePassword(oldPassword, newPassword) {
  const teacher = await getTeacher();

  if (teacher.password !== oldPassword) {
    return {
      success: false,
      error: 'Current password is incorrect',
    };
  }

  await updateTeacher({ password: newPassword });

  return { success: true };
}
