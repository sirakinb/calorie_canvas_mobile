import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#222',
        },
        tabBarActiveTintColor: '#4ADE80',
        tabBarInactiveTintColor: '#666',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Track Meal',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Food Log',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
