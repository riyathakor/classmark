import { createContext, useContext, useEffect, useReducer } from 'react';
import * as classStorage from '../storage/classStorage';

const ClassContext = createContext(null);

const initialState = {
  isLoading: true,
  classes: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CLASSES':
      return { ...state, isLoading: false, classes: action.classes };
    default:
      return state;
  }
}

export function ClassProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function refresh() {
    const classes = await classStorage.getClasses();
    dispatch({ type: 'SET_CLASSES', classes });
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addClass(name) {
    await classStorage.addClass(name);
    await refresh();
  }

  async function updateClass(id, name) {
    await classStorage.updateClass(id, name);
    await refresh();
  }

  async function toggleClassActive(id) {
    await classStorage.toggleClassActive(id);
    await refresh();
  }

  return (
    <ClassContext.Provider
      value={{ ...state, addClass, updateClass, toggleClassActive, refresh }}
    >
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  const ctx = useContext(ClassContext);
  if (!ctx) throw new Error('useClasses must be used within ClassProvider');
  return ctx;
}