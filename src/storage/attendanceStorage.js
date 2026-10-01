import { getItem, setItem } from './asyncStorageHelpers';
import { STORAGE_KEYS } from './storageKeys';

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getAllRecords() {
    return getItem(STORAGE_KEYS.ATTENDANCE, []);
}

export async function getRecordForClassDate(classId, date) {
    const all = await getAllRecords();
    return all.find((r) => r.classId === classId && r.date === date) || null;
}

export async function getRecordsByClass(classId) {
    const all = await getAllRecords();
    return all
        .filter((r) => r.classId === classId)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function saveAttendance(classId, date, studentStatuses) {
    const all = await getAllRecords();
    const existing = all.find((r) => r.classId === classId && r.date === date);

    if (existing) {
        const updated = all.map((r) =>
            r.id === existing.id
                ? { ...r, records: studentStatuses, updatedAt: new Date().toISOString() }
                : r
        );
        await setItem(STORAGE_KEYS.ATTENDANCE, updated);
        return updated.find((r) => r.id === existing.id);
    }

    const newRecord = {
        id: generateId(),
        classId,
        date,
        records: studentStatuses,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const updated = [...all, newRecord];
    await setItem(STORAGE_KEYS.ATTENDANCE, updated);
    return newRecord;
}