import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Platform } from 'react-native';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
  const isAddRoute = route.name === 'add';

  return {
    headerShown: false,
    tabBarShowLabel: false,
    tabBarStyle: isAddRoute
      ? { display: 'none' } // 👈 Hide tab bar on 'add' screen
      : {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1c1c1e',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          height: Platform.OS === 'ios' ? 80 : 100,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
    tabBarItemStyle: {
      marginTop: 10,
    },
    tabBarIcon: ({ focused, color, size }) => {
      let iconName: keyof typeof Ionicons.glyphMap = 'home';

      if (route.name === 'index') iconName = focused ? 'home' : 'home-outline';
      else if (route.name === 'tasks') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
      else if (route.name === 'setting') iconName = focused ? 'list' : 'list-outline';
      else if (route.name === 'profile') iconName = focused ? 'person' : 'person-outline';


      if (route.name === 'add') {
        return (
          <View
            style={{
              position: 'absolute',
              top: -40,
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: '#0f0f0f',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 0,
            }}
          >
            <View
              style={{
                width: 55,
                height: 55,
                borderRadius: 27.5,
                backgroundColor: '#b97cfc',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="add" size={36} color="#000" />
            </View>
          </View>
        );
      }

      return (
        <Ionicons
          name={iconName}
          size={24}
          color={focused ? '#b97cfc' : '#ccc'}
        />
      );
    },
  };
}}

    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="add" options={{ title: 'Add' }} />
      <Tabs.Screen name="setting" options={{ title: 'Profile' }} />
      <Tabs.Screen name="profile" options={{ title: 'Messages' }} />
    </Tabs>
  );
}
