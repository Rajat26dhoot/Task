
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function Add({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [openCategory, setOpenCategory] = useState(false);
  const [categoryItems, setCategoryItems] = useState([
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

const handleCreateTask = async () => {
  if (!title || !startTime || !endTime || !priority || !category) {
    Alert.alert('Missing Fields', 'Please fill out all required fields.');
    return;
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    date: selectedDate,
    startTime,
    endTime,
    priority,
    category,
    completed: false,
  };

  try {
    const existingTasks = await AsyncStorage.getItem('tasks');
    const parsedTasks = existingTasks ? JSON.parse(existingTasks) : [];

    const updatedTasks = [...parsedTasks, newTask];
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));

    Alert.alert('✅ Task Created', 'Your task was successfully saved.');

    // Optionally reset fields
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setPriority('');
    setCategory('');
    setSelectedDate('');
  } catch (error) {
    console.error('Error saving task:', error);
    Alert.alert('Error', 'Failed to save task.');
  }
};



  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        
        
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>

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
              <Pressable
                style={styles.timeInput}
                onPress={() => {
                  setPickerMode('start');
                  setShowPicker(true);
                }}
              >
                <Text style={styles.timeText}>{startTime || 'Start Time'}</Text>
              </Pressable>

              <Pressable
                style={styles.timeInput}
                onPress={() => {
                  setPickerMode('end');
                  setShowPicker(true);
                }}
              >
                <Text style={styles.timeText}>{endTime || 'End Time'}</Text>
              </Pressable>
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
              setItems={setCategoryItems}
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

            <TouchableOpacity style={styles.button} onPress={handleCreateTask}>
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
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
  pickerContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#b97cfc',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
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
