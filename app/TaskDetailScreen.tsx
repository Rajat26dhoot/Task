import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Task = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: string;
  category: string;
};

type RootStackParamList = {
  Home: undefined;
  TaskDetail: { task: Task };
  EditTask: { task: Task };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TaskDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const task = useLocalSearchParams<Task>(); // Get task data using useLocalSearchParams

  // Fallback if task is undefined or missing required fields
  if (!task || !task.id) {
    Alert.alert('Error', 'No task data provided', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
    return null;
  }

  const [activeTab, setActiveTab] = useState<'details' | 'edit'>('details');
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [selectedDate, setSelectedDate] = useState(task.date || '');
  const [startTime, setStartTime] = useState(task.startTime || '');
  const [endTime, setEndTime] = useState(task.endTime || '');
  const [priority, setPriority] = useState(task.priority || '');
  const [category, setCategory] = useState(task.category || '');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [openCategory, setOpenCategory] = useState(false);
  const [categoryItems] = useState([
    { label: 'Work', value: 'work' },
    { label: 'Personal', value: 'personal' },
    { label: 'Shopping', value: 'shopping' },
    { label: 'Others', value: 'others' },
  ]);

  const formatTo12Hour = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    if (selectedDate) {
      const formattedTime = formatTo12Hour(selectedDate);
      pickerMode === 'start' ? setStartTime(formattedTime) : setEndTime(formattedTime);
    }
    setShowPicker(false);
  };

  const handleSave = async () => {
    if (!title || !startTime || !endTime || !priority || !category) {
      Alert.alert('Missing Fields', 'Please fill out all required fields.');
      return;
    }

    const updatedTask = {
      id: task.id,
      title,
      description,
      date: selectedDate,
      startTime,
      endTime,
      priority,
      category,
    };

    try {
      const existingTasks = await AsyncStorage.getItem('tasks');
      let parsedTasks: Task[] = [];
      try {
        parsedTasks = existingTasks ? JSON.parse(existingTasks) : [];
      } catch (parseError) {
        console.error('Error parsing tasks:', parseError);
        parsedTasks = [];
      }
      const updatedTasks = parsedTasks.map((t) => (t.id === task.id ? updatedTask : t));
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      Alert.alert('✅ Task Updated', 'Your task was successfully updated.');
      setActiveTab('details');
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task.');
    }
  };

  const handleCancel = () => {
    setTitle(task.title || '');
    setDescription(task.description || '');
    setSelectedDate(task.date || '');
    setStartTime(task.startTime || '');
    setEndTime(task.endTime || '');
    setPriority(task.priority || '');
    setCategory(task.category || '');
    setActiveTab('details');
  };

  const handleEdit = () => {
    setActiveTab('edit');
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const tasksJSON = await AsyncStorage.getItem('tasks');
              const tasks = tasksJSON ? JSON.parse(tasksJSON) : [];
              const updated = tasks.filter((t) => t.id !== task.id);
              await AsyncStorage.setItem('tasks', JSON.stringify(updated));
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Task: ${title}\nPriority: ${priority}\nTime: ${startTime} - ${endTime}\nDate: ${selectedDate}\nDescription: ${description || 'No description'}\nCategory: ${category}`,
      });
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'details' && styles.activeTab]}
                onPress={() => setActiveTab('details')}
              >
                <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'edit' && styles.activeTab]}
                onPress={() => setActiveTab('edit')}
              >
                <Text style={[styles.tabText, activeTab === 'edit' && styles.activeTabText]}>Edit</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'details' ? (
              <View style={styles.detailsContainer}>
                <Text style={styles.label}>Title</Text>
                <Text style={styles.detailText}>{title || 'N/A'}</Text>

                <Text style={styles.label}>Date</Text>
                <Text style={styles.detailText}>{selectedDate || 'N/A'}</Text>

                <Text style={styles.label}>Time</Text>
                <Text style={styles.detailText}>{startTime && endTime ? `${startTime} - ${endTime}` : 'N/A'}</Text>

                <Text style={styles.label}>Priority</Text>
                <Text style={styles.detailText}>{priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'N/A'}</Text>

                <Text style={styles.label}>Category</Text>
                <Text style={styles.detailText}>{category ? category.charAt(0).toUpperCase() + category.slice(1) : 'N/A'}</Text>

                <Text style={styles.label}>Description</Text>
                <Text style={styles.detailText}>{description || 'No description'}</Text>

                <View style={styles.bottomBar}>
                  <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleShare}>
                    <Text style={styles.buttonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Calendar
                  style={{ paddingTop: 50 }}
                  current={selectedDate}
                  onDayPress={(day) => setSelectedDate(day.dateString)}
                  markedDates={{
                    [selectedDate]: {
                      selected: true,
                      selectedColor: '#b97cfc',
                    },
                  }}
                  theme={{
                    backgroundColor: '#121212',
                    calendarBackground: '#121212',
                    dayTextColor: '#fff',
                    monthTextColor: '#fff',
                    arrowColor: '#fff',
                    selectedDayTextColor: '#000',
                    selectedDayBackgroundColor: '#f7b2d9',
                  }}
                />

                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {['High', 'Medium', 'Low'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[styles.priorityBox, priority === level.toLowerCase() && styles.priorityBoxSelected]}
                      onPress={() => setPriority(level.toLowerCase())}
                    >
                      <Text style={[styles.priorityText, priority === level.toLowerCase() && styles.priorityTextSelected]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter title"
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={setTitle}
                  accessibilityLabel="Title Input"
                />

                <Text style={styles.label}>Time</Text>
                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => {
                      setPickerMode('start');
                      setShowPicker(true);
                    }}
                  >
                    <Text style={styles.timeText}>{startTime || 'Start Time'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => {
                      setPickerMode('end');
                      setShowPicker(true);
                    }}
                  >
                    <Text style={styles.timeText}>{endTime || 'End Time'}</Text>
                  </TouchableOpacity>
                </View>

                {showPicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}

                <Text style={styles.label}>Category</Text>
                <DropDownPicker
                  open={openCategory}
                  value={category}
                  items={categoryItems}
                  setOpen={setOpenCategory}
                  setValue={setCategory}
                  setItems={() => {}} // No-op for immutability
                  placeholder="Select category"
                  style={{ backgroundColor: '#1e1e1e', borderColor: '#333', marginBottom: 10 }}
                  dropDownContainerStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                  textStyle={{ color: '#fff' }}
                  placeholderStyle={{ color: '#999' }}
                  listItemLabelStyle={{ color: '#fff' }}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Enter description"
                  placeholderTextColor="#999"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 60,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  activeTab: {
    borderBottomColor: '#b97cfc',
  },
  tabText: {
    color: '#aaa',
    fontSize: 16,
  },
  activeTabText: {
    color: '#b97cfc',
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
  },
  detailText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    color: '#aaa',
    fontSize: 15,
    marginTop: 15,
    marginBottom: 5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  timeInput: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 10,
    flex: 1,
  },
  timeText: {
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#b97cfc',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 150,
  },
  deleteButton: {
    backgroundColor: '#b97cfc', 
  },
  cancelButton: {
    backgroundColor: '#555',
    marginRight: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 18,
    backgroundColor: '#0f0f0f',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  priorityBox: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  priorityBoxSelected: {
    backgroundColor: '#b97cfc',
    borderColor: '#b97cfc',
  },
  priorityText: {
    color: '#fff',
    fontWeight: '500',
  },
  priorityTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
});