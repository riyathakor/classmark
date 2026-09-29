import { getItem, setItem } from './asyncStorageHelpers';
import { STORAGE_KEYS } from './storageKeys';

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getClasses() {
    return getItem(STORAGE_KEYS.CLASSES, []);
}

export async function addClass(name) {
    const classes = await getClasses();
    const newClass = {
        id: generateId(),
        name: name.trim(),
        isActive: true,
        createdAt: new Date().toISOString(),
    };
    const updated = [...classes, newClass];
    await setItem(STORAGE_KEYS.CLASSES, updated);
    return newClass;
}

export async function updateClassName(id, name) {
    const classes = await getClasses();
    const updated = classes.map((c) => (c.id === id ? { ...c, name: name.trim() } : c));
    await setItem(STORAGE_KEYS.CLASSES, updated);
    return updated;
}

export async function toggleClassActive(id) {
    const classes = await getClasses();
    const updated = classes.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    await setItem(STORAGE_KEYS.CLASSES, updated);
    return updated;
}