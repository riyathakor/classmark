// Fee + month helpers shared by Finance screens.

// A student's monthly fee. Older entries may still use the previous customFee field.
export function getStudentFee(student) {
    return student?.monthlyFee ?? student?.customFee ?? 0;
}

export function currentMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonth(monthKey) {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
    });
}

// Change the currency symbol here if needed.
export function formatMoney(amount) {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function shiftMonth(monthKey, delta) {
    const [year, month] = monthKey.split('-').map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}