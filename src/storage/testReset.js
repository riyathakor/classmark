
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { DEFAULT_TEACHER } from './teacherStorage';

const RESET_MARKER = 'classmark:testReset:v1';

export async function resetTestDataOnce() {
    const alreadyReset = await AsyncStorage.getItem(RESET_MARKER);

    if (alreadyReset === 'done') {
        return;
    }

    const appKeys = [
        STORAGE_KEYS.TEACHER,
        STORAGE_KEYS.REMEMBER_ME,
        STORAGE_KEYS.SESSION,
        STORAGE_KEYS.CLASSES,
        STORAGE_KEYS.STUDENTS,
        STORAGE_KEYS.ATTENDANCE,
    ];

    // Remove all known Classmark data.
    await AsyncStorage.multiRemove(appKeys);

    // Seed the new teacher and mark the reset as complete.
    await AsyncStorage.multiSet([
        [
            STORAGE_KEYS.TEACHER,
            JSON.stringify(DEFAULT_TEACHER),
        ],
        [RESET_MARKER, 'done'],
    ]);
}
