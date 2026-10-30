import '../global.css';
import { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '../src/context/AuthContext';
import { ClassProvider } from '../src/context/ClassContext';
import { StudentProvider } from '../src/context/StudentContext';
import { AttendanceProvider } from '../src/context/AttendanceContext';
import { PaymentProvider } from '../src/context/PaymentContext';
import VideoSplash from '../src/components/VideoSplash';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  const finishSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <ClassProvider>
        <StudentProvider>
          <AttendanceProvider>
            <PaymentProvider>
              <View style={{ flex: 1 }}>
                <StatusBar style="dark" />

                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="class/[id]" />
                  <Stack.Screen name="attendance/[classId]" />
                </Stack>

                {showSplash && <VideoSplash onFinish={finishSplash} />}
              </View>
            </PaymentProvider>
          </AttendanceProvider>
        </StudentProvider>
      </ClassProvider>
    </AuthProvider>
  );
}