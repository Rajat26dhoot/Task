import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure how notifications are displayed when app is foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [selectedTab, setSelectedTab] = useState('Ongoing');
  const [storedTasks, setStoredTasks] = useState([]);
  const navigation = useNavigation();
  const [username, setUsername] = useState('');


  const scheduleNotificationsForTasks = async () => {
  try {
    const tasksJSON = await AsyncStorage.getItem('tasks');
    const tasks = tasksJSON ? JSON.parse(tasksJSON) : [];

    for (const task of tasks) {
      if (!task.completed) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `📝 Task: ${task.title}`,
            body: `Scheduled from ${task.startTime} to ${task.endTime}`,
          },
          trigger: {
            seconds:2, // Trigger notification after 30 seconds
          },
        });
      }
    }

    console.log('✅ Notifications scheduled for tasks!');
  } catch (error) {
    console.error('❌ Error scheduling notifications:', error);
  }
};


  const loadUsername = async () => {
  try {
    const name = await AsyncStorage.getItem('userName');
    setUsername(name || ''); // default fallback just in case
  } catch (err) {
    console.error('Error fetching username:', err);
  }
};


  const tabs = ['Ongoing', 'Completed', 'Due Soon', 'Upcoming'];

  // Load tasks from AsyncStorage
  const loadTasksFromStorage = async () => {
    try {
      const tasksJSON = await AsyncStorage.getItem('tasks');
      const tasks = tasksJSON ? JSON.parse(tasksJSON) : [];
      setStoredTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };




  // Toggle completion
  const updateTaskCompletion = async (id, completed) => {
    try {
      const updated = storedTasks.map(task =>
        task.id === id ? { ...task, completed } : task
      );
      setStoredTasks(updated);
      await AsyncStorage.setItem('tasks', JSON.stringify(updated));
    } catch (err) {
      console.error('Error updating task completion:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasksFromStorage();
      loadUsername();
      scheduleNotificationsForTasks();
    }, [])
  );

  const filteredTasks = storedTasks.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.date);
    if (selectedTab === 'Ongoing') return !task.completed;
    if (selectedTab === 'Completed') return task.completed;
    if (selectedTab === 'Due Soon') {
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);
      return !task.completed && taskDate <= threeDaysFromNow && taskDate >= today;
    }
    if (selectedTab === 'Upcoming') {
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);
      return !task.completed && taskDate > threeDaysFromNow;
    }
    return false;
  });

  // ---------- Notifications Setup ----------

  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
    });
  }, []);

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "👋 Reminder!",
        body: 'Check your tasks now!',
      },
      trigger: { seconds: 2 },
    });
  };

  const handleNotificationBell = () => {
    sendNotification(); // You could use logic to notify only if there are due/overdue tasks
  };

  

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 130 }}>
      <View style={styles.topRow}>
        <View>
         <Text style={styles.greeting}>Hello {username} 👋</Text>
          <Text style={styles.header}>Manage Your{'\n'}Daily Task</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationBell}>
          <Ionicons name="notifications-outline" size={22} color="#b97cfc" />
        </TouchableOpacity>
      </View>

     

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task Cards */}
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => navigation.navigate('TaskDetailScreen', { ...task })}
            activeOpacity={0.8}
          >
            <View style={styles.taskHeader}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View
      style={[
        styles.priorityBadge,
        {
          backgroundColor:
            task.priority === 'high'
              ? '#FF5A5F'
              : task.priority === 'medium'
              ? '#FFD166'
              : '#06D6A0',
        },
      ]}
    >
      <Text style={styles.priorityText}>{task.priority}</Text>
    </View>
  </View>
  <Checkbox
    value={!!task.completed}
    onValueChange={(newValue) => updateTaskCompletion(task.id, newValue)}
    color={task.completed ? '#00C851' : undefined}
  />
</View>

            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={18} color="#ccc" />
              <Text style={styles.timeText}>{task.startTime} - {task.endTime}</Text>
            </View>
            <Text style={styles.dueDate}>
              Due Date: <Text style={{ color: '#fff' }}>{task.date}</Text>
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 30 }}>
          No tasks to show.
        </Text>
      )}
    </ScrollView>
  );
}

// Push Notification Permission
async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for notifications!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return token;
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    color: '#ccc',
    fontSize: 20,
    marginBottom: 6,
  },
  header: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '700',
  },
  notificationButton: {
    backgroundColor: '#1f1f1f',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#b97cfc',
  },
  categoryContainer: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryCard: {
    flex: 1,
    height: 100,
    borderRadius: 20,
    padding: 15,
    marginRight: 10,
    justifyContent: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#000',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  tabButton: {
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    color: '#aaa',
    fontWeight: '500',
    fontSize: 17,
  },
  tabTextActive: {
    color: '#b97cfc',
  },
  taskCard: {
    backgroundColor: '#2d2d2e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  timeText: {
    color: '#ccc',
    fontSize: 15,
    marginLeft: 6,
  },
  dueDate: {
    color: '#999',
    fontSize: 16,
    marginBottom: 5,
    marginTop: 8,
  },
});
