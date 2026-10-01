import { createContext, useContext, useEffect, useReducer } from 'react';
import * as attendanceStorage from '../storage/attendanceStorage';

const AttendanceContext = createContext(null);

const initialState = {
    isLoading: true,
    records: [],
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_RECORDS':
            return { ...state, isLoading: false, records: action.records };
        default:
            return state;
    }
}

export function AttendanceProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    async function refresh() {
        const records = await attendanceStorage.getAllRecords();
        dispatch({ type: 'SET_RECORDS', records });
    }

    useEffect(() => {
        refresh();
    }, []);

    function getRecordForClassDate(classId, date) {
        return state.records.find((r) => r.classId === classId && r.date === date) || null;
    }

    function getRecordsByClass(classId) {
        return state.records
            .filter((r) => r.classId === classId)
            .sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    async function saveAttendance(classId, date, studentStatuses) {
        await attendanceStorage.saveAttendance(classId, date, studentStatuses);
        await refresh();
    }

    return (
        <AttendanceContext.Provider
            value={{ ...state, getRecordForClassDate, getRecordsByClass, saveAttendance, refresh }}
        >
            {children}
        </AttendanceContext.Provider>
    );
}

export function useAttendance() {
    const ctx = useContext(AttendanceContext);
    if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider');
    return ctx;
}