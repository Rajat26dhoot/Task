import React from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from "expo-router";

// Import your screens
import IndexScreen from '@/app/(tabs)/index';
import TasksScreen from '@/app/(tabs)/tasks';
import SettingScreen from '@/app/(tabs)/setting';
import ProfileScreen from '@/app/(tabs)/profile';

export default function TabLayout() {
  const _renderIcon = (routeName, selectedTab) => {
    let icon = '';
    switch (routeName) {
      case 'home':
        icon = 'home-outline';
        break;
      case 'tasks':
        icon = 'checkmark-done-outline';
        break;
      case 'settings':
        icon = 'search-outline';
        break;
      case 'profile':
        icon = 'person-outline';
        break;
      default:
        icon = 'ellipse-outline';
    }
    return (
      <Ionicons
        name={icon}
        size={25}
        color={routeName === selectedTab ? '#b97cfc' : 'white'}
      />
    );
  };

  const renderTabBar = ({ routeName, selectedTab, navigate }) => (
    <TouchableOpacity
      onPress={() => navigate(routeName)}
      style={styles.tabbarItem}
    >
      {_renderIcon(routeName, selectedTab)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <CurvedBottomBarExpo.Navigator
        type="DOWN"
        style={styles.bottomBar}
        shadowStyle={styles.shadow}
        height={55}
        circleWidth={50}
        bgColor="black"
        initialRouteName="home"
        borderTopLeftRight
        renderCircle={({ selectedTab, navigate }) => (
          <Animated.View style={styles.btnCircleUp}>
            <Link href="/add" asChild>
  <TouchableOpacity style={styles.button}>
      <Ionicons name="add" color="#b97cfc" size={50} />
  </TouchableOpacity>
</Link>
          </Animated.View>
        )}
        tabBar={renderTabBar}
      >
        <CurvedBottomBarExpo.Screen
          name="home"
          position="LEFT"
          component={IndexScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="tasks"
          position="LEFT"
          component={TasksScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="settings"
          position="RIGHT"
          component={SettingScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="profile"
          position="RIGHT"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
      </CurvedBottomBarExpo.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', 
  },
  shadow: {
    shadowColor: '#DDDDDD',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomBar: {
  },
  btnCircleUp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    borderWidth: 2,
    borderColor: '#b97cfc',
    bottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
