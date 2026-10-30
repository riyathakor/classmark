import { getStudentFee } from './fees';

export function getTotalIncome(payments) {
    return payments.reduce((sum, p) => sum + p.amount, 0);
}

// Per-class and overall numbers for one month ('YYYY-MM').
// due = collected + pending, where pending is the fee of every current student
// in an active class who has no payment that month.
export function getMonthSummary(classes, students, payments, month) {
    const monthPayments = payments.filter((p) => p.month === month);

    const rows = classes.map((c) => {
        const classStudents = students.filter((s) => s.classId === c.id);
        const classPayments = monthPayments.filter((p) => p.classId === c.id);
        const paidIds = new Set(classPayments.map((p) => p.studentId));

        const collected = classPayments.reduce((sum, p) => sum + p.amount, 0);
        let pending = 0;
        let paidCount = 0;
        classStudents.forEach((s) => {
            if (paidIds.has(s.id)) {
                paidCount++;
            } else if (c.isActive) {
                pending += getStudentFee(s);
            }
        });

        const due = collected + pending;
        const percent = due > 0 ? Math.round((collected / due) * 100) : null;

        return {
            classItem: c,
            collected,
            pending,
            due,
            percent,
            paidCount,
            studentCount: classStudents.length,
        };
    });

    // Show active classes, plus inactive ones only if they collected money that month.
    const visibleRows = rows.filter((r) => r.classItem.isActive || r.collected > 0);
    const activeRows = rows.filter((r) => r.classItem.isActive);

    return {
        rows: visibleRows,
        collected: rows.reduce((sum, r) => sum + r.collected, 0),
        pending: rows.reduce((sum, r) => sum + r.pending, 0),
        paidCount: activeRows.reduce((sum, r) => sum + r.paidCount, 0),
        studentCount: activeRows.reduce((sum, r) => sum + r.studentCount, 0),
    };
}