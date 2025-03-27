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
      
      await signUp(email, password);
      
      // The AuthContext will handle the redirect to onboarding
      console.log('Sign up successful, AuthContext will handle redirect');
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Error', error.message || 'Failed to sign up');
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