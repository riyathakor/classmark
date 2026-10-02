export function getClassAttendancePercent(classId, allRecords) {
    const classRecords = allRecords.filter((r) => r.classId === classId);
    if (classRecords.length === 0) return null;

    let totalMarks = 0;
    let totalPresent = 0;
    classRecords.forEach((r) => {
        r.records.forEach((entry) => {
            totalMarks++;
            if (entry.status === 'present') totalPresent++;
        });
    });

    return totalMarks ? Math.round((totalPresent / totalMarks) * 100) : null;
}

export function getBarColor(percent) {
    if (percent == null) return 'bg-border';
    if (percent >= 75) return 'bg-success';
    if (percent >= 50) return 'bg-primary';
    return 'bg-danger';
}