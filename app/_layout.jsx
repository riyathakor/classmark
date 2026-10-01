import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { ClassProvider } from '../src/context/ClassContext';
import { StudentProvider } from '../src/context/StudentContext';
import { AttendanceProvider } from '../src/context/AttendanceContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ClassProvider>
        <StudentProvider>
          <AttendanceProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="class/[id]" />
              <Stack.Screen name="attendance/[classId]" />
            </Stack>
          </AttendanceProvider>
        </StudentProvider>
      </ClassProvider>
    </AuthProvider>
  );
}