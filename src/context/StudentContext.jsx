import { createContext, useContext, useEffect, useReducer } from 'react';
import * as studentStorage from '../storage/studentStorage';

const StudentContext = createContext(null);

const initialState = {
  isLoading: true,
  students: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STUDENTS':
      return { ...state, isLoading: false, students: action.students };
    default:
      return state;
  }
}

export function StudentProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function refresh() {
    const students = await studentStorage.getAllStudents();
    dispatch({ type: 'SET_STUDENTS', students });
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addStudent(classId, name, monthlyFee) {
    await studentStorage.addStudent(classId, name, monthlyFee);
    await refresh();
  }

  async function updateStudent(id, name, monthlyFee) {
    await studentStorage.updateStudent(id, name, monthlyFee);
    await refresh();
  }

  async function removeStudent(id) {
    await studentStorage.removeStudent(id);
    await refresh();
  }

  function getStudentsByClass(classId) {
    return state.students
      .filter((s) => s.classId === classId)
      .sort((a, b) => a.rollNumber - b.rollNumber);
  }

  return (
    <StudentContext.Provider
      value={{ ...state, addStudent, updateStudent, removeStudent, getStudentsByClass, refresh }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudents must be used within StudentProvider');
  return ctx;
}