import React from 'react';
import { Stack } from 'expo-router';
import {
  SafeAreaView,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="TaskDetailScreen" />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});