import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-gesture-handler';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import logo from '../../assets/images/logo4.png';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting direct sign in process...');
      
      // Try direct Supabase sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Direct sign in error:', error);
        throw error;
      }
      
      console.log('Direct sign in successful:', data);
      
      if (data.session) {
        console.log('Session established, checking profile...');
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('daily_calorie_goal')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          console.log('Profile fetched:', profileData);
          
          const hasCompletedSetup = profileData?.daily_calorie_goal != null;
          
          if (!hasCompletedSetup) {
            console.log('Profile incomplete, navigating to onboarding...');
            await router.replace('/onboarding');
          } else {
            console.log('Profile complete, navigating to tabs...');
            await router.replace('/(tabs)');
          }
        }
      } else {
        console.error('No session after sign in');
        throw new Error('Failed to establish session');
      }
    } catch (error: any) {
      console.error('Sign in process error:', error);
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Image
                source={logo}
                style={styles.logo}
                resizeMode="contain"
              />
              <ThemedText style={styles.subtitle}>
                Sign in to continue to Calorie Canvas
              </ThemedText>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignIn}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText style={styles.buttonText}>Sign In with Email</ThemedText>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <ThemedText style={styles.dividerText}>OR</ThemedText>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.signInButton, styles.phoneButton]}
                onPress={() => router.push('/phone-sign-in')}>
                <View style={styles.buttonContent}>
                  <MaterialIcons name="phone" size={24} color="white" style={styles.buttonIcon} />
                  <ThemedText style={styles.buttonText}>Sign In with Phone</ThemedText>
                </View>
              </TouchableOpacity>

              <View style={styles.footer}>
                <ThemedText>Don't have an account? </ThemedText>
                <TouchableOpacity onPress={() => router.push('/sign-up')}>
                  <ThemedText style={styles.signUpText}>Sign Up</ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push('/reset-password')}>
                <ThemedText style={styles.forgotPasswordText}>
                  Forgot Password?
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: '#ff6b00',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  phoneButton: {
    backgroundColor: '#0A7EA4',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signUpText: {
    color: '#0A7EA4',
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#666',
  },
}); 