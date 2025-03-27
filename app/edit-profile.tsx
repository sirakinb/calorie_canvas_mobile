import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ThemedText } from '../components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileData {
  age: number;
  sex: string;
  height_ft: number;
  height_in: number;
  weight: number;
  activity_level: string;
  fitness_goal: string;
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carbs_goal: number;
  daily_fat_goal: number;
}

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    age: 0,
    sex: '',
    height_ft: 0,
    height_in: 0,
    weight: 0,
    activity_level: '',
    fitness_goal: '',
    daily_calorie_goal: 0,
    daily_protein_goal: 0,
    daily_carbs_goal: 0,
    daily_fat_goal: 0,
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          age: parseInt(profileData.age.toString()),
          sex: profileData.sex,
          height_ft: parseInt(profileData.height_ft.toString()),
          height_in: parseInt(profileData.height_in.toString()),
          weight: parseInt(profileData.weight.toString()),
          activity_level: profileData.activity_level,
          fitness_goal: profileData.fitness_goal,
          daily_calorie_goal: parseInt(profileData.daily_calorie_goal.toString()),
          daily_protein_goal: parseInt(profileData.daily_protein_goal.toString()),
          daily_carbs_goal: parseInt(profileData.daily_carbs_goal.toString()),
          daily_fat_goal: parseInt(profileData.daily_fat_goal.toString()),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4ADE80" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Edit Profile</ThemedText>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
            {saving ? (
              <ActivityIndicator size="small" color="#4ADE80" />
            ) : (
              <ThemedText style={styles.saveText}>Save</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
          <View style={styles.inputContainer}>
            <LabeledInput
              label="Age"
              value={profileData.age.toString()}
              onChangeText={(text) => setProfileData({ ...profileData, age: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <LabeledInput
              label="Sex"
              value={profileData.sex}
              onChangeText={(text) => setProfileData({ ...profileData, sex: text })}
            />
            <View style={styles.row}>
              <LabeledInput
                label="Height (ft)"
                value={profileData.height_ft.toString()}
                onChangeText={(text) => setProfileData({ ...profileData, height_ft: parseInt(text) || 0 })}
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginRight: 8 }}
              />
              <LabeledInput
                label="Height (in)"
                value={profileData.height_in.toString()}
                onChangeText={(text) => setProfileData({ ...profileData, height_in: parseInt(text) || 0 })}
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginLeft: 8 }}
              />
            </View>
            <LabeledInput
              label="Weight (lbs)"
              value={profileData.weight.toString()}
              onChangeText={(text) => setProfileData({ ...profileData, weight: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Fitness Profile</ThemedText>
          <View style={styles.inputContainer}>
            <View style={styles.selectContainer}>
              <ThemedText style={styles.inputLabel}>Activity Level</ThemedText>
              <View style={styles.optionsRow}>
                {['sedentary', 'moderate', 'very'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionButton,
                      profileData.activity_level === level && styles.optionButtonSelected,
                    ]}
                    onPress={() => setProfileData({ ...profileData, activity_level: level })}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        profileData.activity_level === level && styles.optionTextSelected,
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectContainer}>
              <ThemedText style={styles.inputLabel}>Fitness Goal</ThemedText>
              <View style={styles.optionsRow}>
                {['maintenance', 'fat_loss', 'muscle_gain'].map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.optionButton,
                      profileData.fitness_goal === goal && styles.optionButtonSelected,
                    ]}
                    onPress={() => setProfileData({ ...profileData, fitness_goal: goal })}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        profileData.fitness_goal === goal && styles.optionTextSelected,
                      ]}
                    >
                      {goal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Daily Goals</ThemedText>
          <View style={styles.inputContainer}>
            <LabeledInput
              label="Daily Calories"
              value={profileData.daily_calorie_goal.toString()}
              onChangeText={(text) => setProfileData({ ...profileData, daily_calorie_goal: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <LabeledInput
              label="Daily Protein (g)"
              value={profileData.daily_protein_goal.toString()}
              onChangeText={(text) => setProfileData({ ...profileData, daily_protein_goal: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <LabeledInput
              label="Daily Carbs (g)"
              value={profileData.daily_carbs_goal.toString()}
              onChangeText={(text) => setProfileData({ ...profileData, daily_carbs_goal: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <LabeledInput
              label="Daily Fat (g)"
              value={profileData.daily_fat_goal.toString()}
              onChangeText={(text) => setProfileData({ ...profileData, daily_fat_goal: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
  containerStyle?: object;
}

const LabeledInput = ({ label, value, onChangeText, keyboardType = 'default', containerStyle }: LabeledInputProps) => (
  <View style={[styles.inputWrapper, containerStyle]}>
    <ThemedText style={styles.inputLabel}>{label}</ThemedText>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#666"
      autoCapitalize="none"
    />
  </View>
);

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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#4ADE80',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#999',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  selectContainer: {
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  optionButtonSelected: {
    backgroundColor: '#4ADE80',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
}); 