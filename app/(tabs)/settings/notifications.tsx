import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, Alert, Platform, ActivityIndicator } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { OfflineNotice } from '../../../components/OfflineNotice';

interface NotificationPreferences {
  mealReminders: boolean;
  weeklyReport: boolean;
  goalProgress: boolean;
  waterReminders: boolean;
}

const NOTIFICATION_PREFS_KEY = '@notification_preferences';

export default function NotificationPreferencesScreen() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    mealReminders: false,
    weeklyReport: false,
    goalProgress: false,
    waterReminders: false,
  });
  const [loading, setLoading] = useState(true);
  const { isOffline } = useNetworkStatus();

  useEffect(() => {
    loadPreferences();
    checkPermissions();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPrefs = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in your device settings to receive updates.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (isOffline) {
      Alert.alert(
        'No Internet Connection',
        'Please connect to the internet to change notification settings.'
      );
      return;
    }

    const hasPermission = await checkPermissions();
    if (!hasPermission) return;

    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    try {
      await AsyncStorage.setItem(
        NOTIFICATION_PREFS_KEY,
        JSON.stringify(newPreferences)
      );
      setPreferences(newPreferences);

      // Schedule or cancel notifications based on new preferences
      if (newPreferences[key]) {
        scheduleNotification(key);
      } else {
        cancelNotification(key);
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const scheduleNotification = async (type: keyof NotificationPreferences) => {
    // Implementation will vary based on notification type
    switch (type) {
      case 'mealReminders':
        // Schedule daily meal reminders
        break;
      case 'weeklyReport':
        // Schedule weekly progress report
        break;
      case 'goalProgress':
        // Schedule goal progress updates
        break;
      case 'waterReminders':
        // Schedule water intake reminders
        break;
    }
  };

  const cancelNotification = async (type: keyof NotificationPreferences) => {
    // Cancel specific notification type
    // Implementation will depend on how you've structured your notification IDs
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineNotice />
      <View style={styles.content}>
        <ThemedText style={styles.title}>Notification Preferences</ThemedText>
        
        <View style={styles.section}>
          <NotificationOption
            title="Meal Reminders"
            description="Get reminded to log your meals"
            value={preferences.mealReminders}
            onToggle={() => handleToggle('mealReminders')}
            disabled={isOffline}
          />
          
          <NotificationOption
            title="Weekly Report"
            description="Receive a summary of your weekly progress"
            value={preferences.weeklyReport}
            onToggle={() => handleToggle('weeklyReport')}
            disabled={isOffline}
          />
          
          <NotificationOption
            title="Goal Progress"
            description="Updates on your nutrition goals"
            value={preferences.goalProgress}
            onToggle={() => handleToggle('goalProgress')}
            disabled={isOffline}
          />
          
          <NotificationOption
            title="Water Reminders"
            description="Reminders to stay hydrated"
            value={preferences.waterReminders}
            onToggle={() => handleToggle('waterReminders')}
            disabled={isOffline}
          />
        </View>

        <ThemedText style={styles.note}>
          {Platform.OS === 'ios' 
            ? 'You can also manage notifications in your device Settings.'
            : 'You can also manage notifications in your device Settings > Apps > Calorie Canvas.'}
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

interface NotificationOptionProps {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function NotificationOption({
  title,
  description,
  value,
  onToggle,
  disabled,
}: NotificationOptionProps) {
  return (
    <View style={styles.option}>
      <View style={styles.optionText}>
        <ThemedText style={styles.optionTitle}>{title}</ThemedText>
        <ThemedText style={styles.optionDescription}>{description}</ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#333', true: '#4ADE80' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  optionText: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
  },
}); 