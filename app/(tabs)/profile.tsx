import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ThemedText } from '../../components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileData {
  id?: string;
  age: number | null;
  sex: string | null;
  height_ft: number | null;
  height_in: number | null;
  weight: number | null;
  activity_level: string | null;
  fitness_goal: string | null;
  daily_calorie_goal: number | null;
  daily_protein_goal: number | null;
  daily_carbs_goal: number | null;
  daily_fat_goal: number | null;
  created_at?: string;
  updated_at?: string;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Profile screen is now focused');
      
      const refreshProfile = async () => {
        try {
          console.log('Checking for profile updates...');
          
          const shouldRefresh = await AsyncStorage.getItem('REFRESH_PROFILE');
          console.log('REFRESH_PROFILE flag:', shouldRefresh);
          
          if (shouldRefresh === 'true' || !profileData) {
            console.log('Fetching fresh profile data...');
            await fetchProfileData();
            await AsyncStorage.removeItem('REFRESH_PROFILE');
          }
        } catch (error) {
          console.error('Error in refreshProfile:', error);
          setError('Failed to refresh profile data');
        }
      };
      
      refreshProfile();
    }, [profileData])
  );

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profile data...', { userId: user?.id });
      
      if (!user?.id) {
        throw new Error('No user ID found');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      if (data) {
        const cleanedData = { ...data };
        if (cleanedData.age === 0) cleanedData.age = null;
        if (cleanedData.height_ft === 0) cleanedData.height_ft = null;
        if (cleanedData.height_in === 0) cleanedData.height_in = null;
        if (cleanedData.weight === 0) cleanedData.weight = null;
        if (cleanedData.daily_calorie_goal === 0) cleanedData.daily_calorie_goal = null;
        if (cleanedData.daily_protein_goal === 0) cleanedData.daily_protein_goal = null;
        if (cleanedData.daily_carbs_goal === 0) cleanedData.daily_carbs_goal = null;
        if (cleanedData.daily_fat_goal === 0) cleanedData.daily_fat_goal = null;
        
        setProfileData(cleanedData);
      }
      
    } catch (error: any) {
      console.error('Error in fetchProfileData:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      console.log('Profile: Initiating sign out...');
      await signOut();
      console.log('Profile: Sign out successful');
    } catch (error) {
      console.error('Profile: Error signing out:', error);
      Alert.alert('Sign Out Error', 'Could not sign out. Please try again.');
      setSigningOut(false);
    }
  };

  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined || value === '' || value === 0) return '-';
    
    try {
      switch (key) {
        case 'activity_level':
          if (value === 'sedentary') return 'Sedentary';
          if (value === 'light') return 'Light';
          if (value === 'moderate') return 'Moderate';
          if (value === 'active') return 'Active';
          if (value === 'very_active') return 'Very Active';
          // Return the value with proper capitalization if it's not one of the expected values
          return value.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        case 'fitness_goal':
          if (value === 'maintenance') return 'Maintenance';
          if (value === 'fat_loss') return 'Fat Loss';
          if (value === 'muscle_gain') return 'Muscle Gain';
          // Return the value with proper capitalization if it's not one of the expected values
          return value.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        case 'age':
          return `${value} years`;
        
        case 'weight':
          return `${value} lbs`;
        
        case 'height':
          const ft = profileData?.height_ft || 0;
          const inch = profileData?.height_in || 0;
          if (ft === 0 && inch === 0) return '-';
          return `${ft}' ${inch}"`;
        
        default:
          return value.toString();
      }
    } catch (error) {
      console.error(`Error formatting value for ${key}:`, error);
      return '-';
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProfileData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ADE80" />
          <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </View>
      </View>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4ADE80"
            colors={["#4ADE80"]}
          />
        }
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
          <View style={styles.infoContainer}>
            <InfoRow label="Age" value={formatValue('age', profileData?.age)} />
            <InfoRow 
              label="Sex" 
              value={profileData?.sex ? profileData?.sex.charAt(0).toUpperCase() + profileData?.sex.slice(1) : '-'} 
            />
            <InfoRow 
              label="Height" 
              value={
                (profileData?.height_ft || profileData?.height_in) ? 
                `${profileData?.height_ft || 0}' ${profileData?.height_in || 0}"` : 
                '-'
              } 
            />
            <InfoRow 
              label="Weight" 
              value={formatValue('weight', profileData?.weight)} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Fitness Profile</ThemedText>
          <View style={styles.infoContainer}>
            <InfoRow 
              label="Activity Level" 
              value={formatValue('activity_level', profileData?.activity_level)} 
            />
            <InfoRow 
              label="Fitness Goal" 
              value={formatValue('fitness_goal', profileData?.fitness_goal)} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Daily Goals</ThemedText>
          <View style={styles.infoContainer}>
            <InfoRow 
              label="Calories" 
              value={profileData?.daily_calorie_goal ? `${profileData.daily_calorie_goal} cal` : '- cal'} 
            />
            <InfoRow 
              label="Protein" 
              value={profileData?.daily_protein_goal ? `${profileData.daily_protein_goal} g` : '- g'} 
            />
            <InfoRow 
              label="Carbs" 
              value={profileData?.daily_carbs_goal ? `${profileData.daily_carbs_goal} g` : '- g'} 
            />
            <InfoRow 
              label="Fat" 
              value={profileData?.daily_fat_goal ? `${profileData.daily_fat_goal} g` : '- g'} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Legal</ThemedText>
          <View style={styles.infoContainer}>
            <TouchableOpacity 
              style={styles.legalLink}
              onPress={() => router.push('/privacy-policy')}
            >
              <ThemedText style={styles.legalText}>Privacy Policy</ThemedText>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.legalLink}
              onPress={() => router.push('/terms-of-service')}
            >
              <ThemedText style={styles.legalText}>Terms of Service</ThemedText>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#FF4444" size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={24} color="#FF4444" />
              <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  // If the value is empty, missing, or just a dash, show a consistent dash
  const displayValue = (value === '-' || !value || value === '- ' || value === 'null' || value === 'undefined' || value === '0') 
    ? '-' 
    : value;
    
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{displayValue}</ThemedText>
    </View>
  );
};

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
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
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
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  legalText: {
    fontSize: 16,
    color: '#fff',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    padding: 16,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 