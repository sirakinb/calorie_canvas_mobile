import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ThemedText } from '../../components/ThemedText';
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

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

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

  const handleEditProfile = () => {
    // Navigate to edit profile screen (we'll create this next)
    router.push('/edit-profile');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
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
          <ThemedText type="title" style={styles.title}>Profile</ThemedText>
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color="#4ADE80" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
          <View style={styles.infoContainer}>
            <InfoRow label="Age" value={`${profileData?.age || '-'} years`} />
            <InfoRow label="Sex" value={profileData?.sex || '-'} />
            <InfoRow 
              label="Height" 
              value={`${profileData?.height_ft || '-'}' ${profileData?.height_in || '-'}"`} 
            />
            <InfoRow label="Weight" value={`${profileData?.weight || '-'} lbs`} />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Fitness Profile</ThemedText>
          <View style={styles.infoContainer}>
            <InfoRow 
              label="Activity Level" 
              value={profileData?.activity_level || '-'} 
            />
            <InfoRow 
              label="Fitness Goal" 
              value={profileData?.fitness_goal || '-'} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Daily Goals</ThemedText>
          <View style={styles.infoContainer}>
            <InfoRow 
              label="Calories" 
              value={`${profileData?.daily_calorie_goal || '-'} cal`} 
            />
            <InfoRow 
              label="Protein" 
              value={`${profileData?.daily_protein_goal || '-'} g`} 
            />
            <InfoRow 
              label="Carbs" 
              value={`${profileData?.daily_carbs_goal || '-'} g`} 
            />
            <InfoRow 
              label="Fat" 
              value={`${profileData?.daily_fat_goal || '-'} g`} 
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF4444" />
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <ThemedText style={styles.value}>{value}</ThemedText>
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
  title: {
    fontSize: 28,
  },
  editButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#4ADE80',
    marginBottom: 12,
  },
  infoContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  label: {
    color: '#999',
  },
  value: {
    color: '#fff',
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    marginBottom: 16,
    gap: 8,
  },
  signOutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
}); 