import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Use environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required. Check your .env file.');
}

console.log('Initializing Supabase with:', {
  url: supabaseUrl,
  keyPreview: supabaseAnonKey.substring(0, 10) + '...',
});

// Logging AsyncStorage for debugging
const logStorageOperation = async (operation: string, key?: string) => {
  try {
    if (key) {
      const keys = await AsyncStorage.getAllKeys();
      console.log(`${operation} - Available keys:`, keys);
      if (keys.includes(key)) {
        const value = await AsyncStorage.getItem(key);
        console.log(`${operation} - Value for ${key}:`, value ? 'exists' : 'null');
      } else {
        console.log(`${operation} - Key ${key} not found`);
      }
    }
  } catch (e) {
    console.error(`Error in ${operation}:`, e);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      async getItem(key) {
        try {
          const data = await AsyncStorage.getItem(key);
          console.log(`Storage getItem for: ${key} - Result:`, data ? 'found' : 'null');
          return data;
        } catch (error) {
          console.error(`Storage getItem error for ${key}:`, error);
          return null;
        }
      },
      async setItem(key, value) {
        try {
          await AsyncStorage.setItem(key, value);
          console.log(`Storage setItem for: ${key} - Value set`);
          await logStorageOperation('setItem', key);
        } catch (error) {
          console.error(`Storage setItem error for ${key}:`, error);
        }
      },
      async removeItem(key) {
        try {
          await AsyncStorage.removeItem(key);
          console.log(`Storage removeItem for: ${key} - Removed`);
        } catch (error) {
          console.error(`Storage removeItem error for ${key}:`, error);
        }
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error.message);
  } else {
    console.log('Supabase connection successful');
    if (data.session) {
      console.log('Active session found:', {
        userId: data.session.user.id,
        expires: data.session.expires_at,
      });
    } else {
      console.log('No active session found');
    }
  }
}); 