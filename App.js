import React from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { Platform, View, Text } from 'react-native';
import AppNavigator from './navigation/AppNavigator';

// You need to replace this with your actual Clerk publishable key
// Get it from https://dashboard.clerk.com
// For web, sometimes .env variables need a full server restart to load
const CLERK_PUBLISHABLE_KEY = (process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Z3VpZGluZy1iZWUtMC5jbGVyay5hY2NvdW50cy5kZXYk').trim();

// Token cache implementation - uses SecureStore on native, localStorage on web
const tokenCache = {
  async getToken(key) {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (err) {
      // Handle error
    }
  },
  async clearToken(key) {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (err) {
      // Handle error
    }
  },
};

export default function App() {
  // Ensure we have a valid key
  if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY.trim() === '') {
    console.error('Clerk publishable key is missing. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: '#ef4444' }}>
          Error: Clerk publishable key is missing.{'\n'}
          Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={CLERK_PUBLISHABLE_KEY}
    >
      <AppNavigator />
    </ClerkProvider>
  );
}
