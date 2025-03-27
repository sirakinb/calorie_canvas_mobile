import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Check if the user is on an auth screen
const useProtectedRoute = (user: any) => {
  const segments = useSegments();
  const router = useRouter();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    console.log('Protected route check:', { 
      segments, 
      inAuthGroup, 
      inOnboarding, 
      userId: user?.id 
    });

    const checkProfile = async () => {
      if (!user) {
        console.log('No user, skipping profile check');
        if (!inAuthGroup) {
          console.log('Redirecting to sign-in...');
          await router.replace('/(auth)/sign-in');
        }
        return;
      }

      try {
        // Check if user has completed profile setup
        const { data, error } = await supabase
          .from('profiles')
          .select('daily_calorie_goal')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking profile:', error);
          return;
        }

        const hasCompletedSetup = data?.daily_calorie_goal != null;
        console.log('Profile check result:', { hasCompletedSetup, userId: user.id });
        setIsProfileComplete(hasCompletedSetup);

        if (!hasCompletedSetup && !inOnboarding) {
          // Redirect to onboarding if profile is not complete
          console.log('Profile incomplete, redirecting to onboarding...');
          await router.replace('/onboarding');
        } else if (hasCompletedSetup && (inAuthGroup || inOnboarding)) {
          // Redirect to home if profile is complete and user is on auth/onboarding screen
          console.log('Profile complete, redirecting to tabs...');
          await router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error in protected route:', error);
      }
    };

    checkProfile();
  }, [user, segments]);

  return isProfileComplete;
};

function RootLayoutNav() {
  const { user } = useAuth();
  useProtectedRoute(user);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_right'
          }} 
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
