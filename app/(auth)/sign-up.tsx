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
import { useRouter } from 'expo-router';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-gesture-handler';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/images/logo4.png';
import { supabase } from '../../lib/supabase';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleEmailSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting sign up process...');
      
      // Add a manual delay to ensure all console logs appear
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try manual sign-up with Supabase directly
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Direct sign up successful:', data);
      
      // Create a profile directly
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            updated_at: new Date().toISOString(),
            username: `user_${data.user.id.substring(0, 8)}`,
            full_name: `User ${data.user.id.substring(0, 8)}`,
            avatar_url: null,
            daily_calorie_goal: null,
            daily_protein_goal: null,
            daily_carbs_goal: null,
            daily_fat_goal: null
          });
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
        } else {
          console.log('Profile created successfully');
        }
        
        // Now try to sign in directly
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.error('Sign in after signup error:', signInError);
        } else {
          console.log('Direct sign in successful:', signInData);
          
          // Force navigation to onboarding
          router.replace('/onboarding');
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert(
        'Sign Up Error',
        error.message || 'Failed to sign up. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/sign-in');
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
              <ThemedText type="title" style={styles.title}>
                Create Account
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
                textContentType="emailAddress"
                autoComplete="email"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="oneTimeCode"
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#666"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="oneTimeCode"
              />

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleEmailSignUp}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <ThemedText>Already have an account? </ThemedText>
                <TouchableOpacity onPress={handleSignIn}>
                  <ThemedText style={styles.signInText}>Sign In</ThemedText>
                </TouchableOpacity>
              </View>
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    marginBottom: 32,
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
  signUpButton: {
    backgroundColor: '#ff6b00',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signInText: {
    color: '#0A7EA4',
    fontWeight: '600',
  },
}); 