import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ user: User; session: Session; }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; }>;
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

  const checkProfileCompletion = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking profile:', error);
      return false;
    }

    // Check that all nutrition goals are explicitly set (not null and not default values)
    const hasExplicitGoals = 
      data?.daily_calorie_goal !== null && 
      data?.daily_protein_goal !== null && 
      data?.daily_carbs_goal !== null && 
      data?.daily_fat_goal !== null && 
      // Also check against common default values
      data?.daily_calorie_goal !== 2000 &&
      data?.daily_protein_goal !== 150 &&
      data?.daily_carbs_goal !== 250 &&
      data?.daily_fat_goal !== 65;

    console.log('Profile completion status:', {
      userId,
      goals: data,
      hasExplicitGoals
    });

    return hasExplicitGoals;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', { event: _event, userId: session?.user?.id });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('Starting sign in process for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Sign in successful:', data);

    if (data.user) {
      // Set session and user immediately
      setUser(data.user);
      setSession(data.session);
    } else {
      console.log('No user data returned from sign in');
    }

    return data;
  };

  const signUp = async (email: string, password: string) => {
    console.log('Starting sign up process for:', email);
    
    try {
      // First, create the account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      console.log('Sign up response:', data);

      if (!data?.user) {
        console.error('No user data returned from sign up');
        throw new Error('Failed to create account. Please try again.');
      }

      // Create user profile after successful signup
      console.log('Creating profile for user:', data.user.id);
      
      const { error: upsertError } = await supabase
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

      if (upsertError) {
        console.error('Error creating profile:', upsertError);
        throw upsertError;
      }

      console.log('Profile created successfully');

      // Explicitly sign in after successful sign up
      console.log('Signing in after successful sign up');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Error signing in after sign up:', signInError);
        throw signInError;
      }

      if (!signInData.session) {
        console.error('No session after sign in');
        throw new Error('Failed to sign in after account creation');
      }

      // Set the session and user
      setUser(signInData.user);
      setSession(signInData.session);

      return signInData;
      
    } catch (error) {
      console.error('Error in sign up process:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error from Supabase signOut:', error);
        throw error;
      }
      
      console.log('Supabase signOut successful');
      
      // Clear session and user state
      setUser(null);
      setSession(null);
      
      // Force navigation to sign-in
      console.log('Navigating to sign-in page...');
      await router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
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