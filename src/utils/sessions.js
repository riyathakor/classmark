// A session is "used" on every date where the student was marked Present OR
// Absent. Students marked "No session" are left out of that date's record, so
// they never count.

export function getSessionsUsed(studentId, allRecords, excludeDate = null) {
    let used = 0;
    allRecords.forEach((r) => {
        if (excludeDate && r.date === excludeDate) return;
        if (r.records.some((entry) => entry.studentId === studentId)) used++;
    });
    return used;
}

// totalSessions is empty for students added before this feature (= no limit yet).
export function getSessionInfo(student, allRecords, excludeDate = null) {
    const used = getSessionsUsed(student.id, allRecords, excludeDate);
    const total = student.totalSessions ?? null;
    const remaining = total == null ? Infinity : total - used;
    return { used, total, remaining, locked: remaining <= 0 };
}

// Present / absent / used counts for one student across every saved date.
export function getStudentSessionStats(studentId, allRecords) {
    let present = 0;
    let absent = 0;
    allRecords.forEach((r) => {
        const entry = r.records.find((e) => e.studentId === studentId);
        if (!entry) return;
        if (entry.status === 'present') present++;
        else if (entry.status === 'absent') absent++;
    });
    return { present, absent, used: present + absent };
}