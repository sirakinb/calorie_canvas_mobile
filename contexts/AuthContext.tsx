import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/sign-in');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email: email
        }
      }
    });
    if (error) throw error;

    // Create user profile after successful signup
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          updated_at: new Date().toISOString(),
          username: `user_${data.user.id.substring(0, 8)}`,
          full_name: `User ${data.user.id.substring(0, 8)}`,
          avatar_url: null
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const signInWithPhone = async (phoneNumber: string) => {
    console.log('AuthContext: Initiating phone sign in for:', phoneNumber);
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
      options: {
        data: {
          phone: phoneNumber
        }
      }
    });
    console.log('AuthContext: Phone sign in response:', { data, error });
    if (error) throw error;
  };

  const verifyOTP = async (phoneNumber: string, token: string) => {
    console.log('AuthContext: Verifying OTP for:', phoneNumber);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: token,
      type: 'sms',
    });
    console.log('AuthContext: OTP verification response:', { data, error });
    if (error) throw error;

    // Update user profile after successful verification
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          updated_at: new Date().toISOString(),
          username: `user_${data.user.id.substring(0, 8)}`,
          full_name: `User ${data.user.id.substring(0, 8)}`,
          avatar_url: null
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }
  };

  const value = {
    session,
    user,
    loading,
    signInWithEmail,
    signUp,
    signOut,
    resetPassword,
    signInWithPhone,
    verifyOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 