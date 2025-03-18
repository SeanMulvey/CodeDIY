import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { Text, View } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const [initializing, setInitializing] = useState(true);
  
  // Add auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? 'User is signed in' : 'User is signed out');
      
      // If auth state changes to signed out, redirect to login
      if (!user && !initializing) {
        console.log('User is not authenticated, redirecting to login');
        router.replace('/auth/login');
      }
      
      if (initializing) {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [initializing, router]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="auth/login" 
          options={{ 
            title: 'Login',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="auth/register" 
          options={{ 
            title: 'Register',
            headerShown: false
          }} 
        />
        <Stack.Screen
          name="search-results/[id]"
          options={{ 
            title: 'Search Results',
            headerShown: true
          }}
        />
      </Stack>
    </>
  );
} 