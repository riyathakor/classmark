import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';

function TabIcon({ name, focused, color, size }) {
  return (
    <Ionicons
      name={focused ? name : `${name}-outline`}
      size={size}
      color={color}
    />
  );
}

function TabLabel({ text, focused, color }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '500',
          color,
        }}
      >
        {text}
      </Text>

      <View
        style={{
          marginTop: 3,
          height: 3,
          width: 22,
          borderRadius: 2,
          backgroundColor: focused ? colors.accent : 'transparent',
        }}
      />
    </View>
  );
}

const icon = (name) => ({ color, size, focused }) => (
  <TabIcon name={name} focused={focused} color={color} size={size} />
);

const label = (text) => ({ color, focused }) => (
  <TabLabel text={text} focused={focused} color={color} />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,

        // Screen background
        sceneStyle: {
          backgroundColor: colors.surface,
        },

        // Bottom navigation
        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: colors.card,
          borderTopWidth: 0,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          elevation: 12,
          shadowColor: colors.primary,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: icon('home'),
          tabBarLabel: label('Home'),
        }}
      />

      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: icon('people'),
          tabBarLabel: label('Classes'),
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: icon('checkmark-circle'),
          tabBarLabel: label('Attendance'),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: icon('bar-chart'),
          tabBarLabel: label('Reports'),
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          tabBarIcon: icon('wallet'),
          tabBarLabel: label('Finance'),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: icon('person'),
          tabBarLabel: label('Profile'),
        }}
      />
    </Tabs>
  );
}