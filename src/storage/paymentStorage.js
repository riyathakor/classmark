import { getItem, setItem } from './asyncStorageHelpers';
import { STORAGE_KEYS } from './storageKeys';

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getAllPayments() {
    return getItem(STORAGE_KEYS.PAYMENTS, []);
}

// One payment per student per month. month = 'YYYY-MM', paidOn = 'YYYY-MM-DD'.
export async function markPaid(studentId, classId, month, amount, paidOn) {
    const all = await getAllPayments();
    const existing = all.find((p) => p.studentId === studentId && p.month === month);
    if (existing) return existing;

    const payment = {
        id: generateId(),
        studentId,
        classId,
        month,
        amount, // saved at payment time, so later fee changes don't rewrite old income
        paidOn,
        createdAt: new Date().toISOString(),
    };
    await setItem(STORAGE_KEYS.PAYMENTS, [...all, payment]);
    return payment;
}

export async function undoPayment(studentId, month) {
    const all = await getAllPayments();
    const updated = all.filter((p) => !(p.studentId === studentId && p.month === month));
    await setItem(STORAGE_KEYS.PAYMENTS, updated);
    return updated;
}