
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import {
  getItem,
  setItem,
  removeItem,
} from '../storage/asyncStorageHelpers';

import { STORAGE_KEYS } from '../storage/storageKeys';
import {
  getTeacher,
  verifyPassword,
} from '../storage/teacherStorage';

import { resetTestDataOnce } from '../storage/testReset';

const AuthContext = createContext(null);

const initialState = {
  isLoading: true,
  isLoggedIn: false,
  teacher: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'BOOT_COMPLETE':
      return {
        ...state,
        isLoading: false,
        isLoggedIn: action.isLoggedIn,
        teacher: action.teacher,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoggedIn: true,
        teacher: action.teacher,
      };

    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        teacher: null,
      };

    case 'UPDATE_TEACHER':
      return {
        ...state,
        teacher: action.teacher,
      };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Reset existing testing data before checking login state.
        await resetTestDataOnce();

        const remembered = await getItem(
          STORAGE_KEYS.REMEMBER_ME,
          false
        );

        if (remembered) {
          const teacher = await getTeacher();

          if (mounted) {
            dispatch({
              type: 'BOOT_COMPLETE',
              isLoggedIn: !!teacher,
              teacher: teacher || null,
            });
          }
        } else if (mounted) {
          dispatch({
            type: 'BOOT_COMPLETE',
            isLoggedIn: false,
            teacher: null,
          });
        }
      } catch (error) {
        console.error('Failed to initialize Classmark:', error);

        if (mounted) {
          dispatch({
            type: 'BOOT_COMPLETE',
            isLoggedIn: false,
            teacher: null,
          });
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  async function login(email, password, rememberMe) {
    const teacher = await getTeacher();

    const emailMatches =
      teacher?.email?.trim().toLowerCase() ===
      email.trim().toLowerCase();

    if (!emailMatches || !(await verifyPassword(password))) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    await setItem(STORAGE_KEYS.REMEMBER_ME, !!rememberMe);

    dispatch({
      type: 'LOGIN_SUCCESS',
      teacher,
    });

    return { success: true };
  }

  async function logout() {
    await removeItem(STORAGE_KEYS.REMEMBER_ME);

    dispatch({ type: 'LOGOUT' });
  }

  function refreshTeacher(teacher) {
    dispatch({
      type: 'UPDATE_TEACHER',
      teacher,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshTeacher,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
