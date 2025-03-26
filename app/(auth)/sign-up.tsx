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
import { supabase } from '../../lib/supabase';
import logo from '../../assets/images/logo4.png';

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
      
      // Try a direct API call first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('Sign up response:', {
        error: error?.message,
        userId: data?.user?.id,
        session: data?.session ? 'exists' : 'none'
      });

      if (error) {
        console.error('Sign up error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        Alert.alert('Error', error.message || 'Failed to sign up');
        return;
      }

      if (data?.user) {
        console.log('Sign up successful:', {
          userId: data.user.id,
          email: data.user.email
        });
        Alert.alert(
          'Success',
          'Account created successfully! You can now sign in.',
          [{ text: 'OK', onPress: () => router.push('/sign-in') }]
        );
      }
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
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
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
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