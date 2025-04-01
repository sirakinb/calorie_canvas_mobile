import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { EventRegister } from 'react-native-event-listeners';

export default function EditProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Edit Profile",
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#4ADE80',
        headerTitleStyle: {
          color: '#fff',
        },
        headerRight: () => (
          <TouchableOpacity 
            style={{ marginRight: 16 }}
            onPress={() => {
              EventRegister.emit('saveProfile');
            }}
          >
            <ThemedText style={{ color: '#4ADE80', fontSize: 16, fontWeight: '600' }}>
              Save
            </ThemedText>
          </TouchableOpacity>
        ),
      }}
    />
  );
}
