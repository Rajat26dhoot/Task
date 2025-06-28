import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const months = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

export default function Setting() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isMonthModalVisible, setMonthModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Helper to generate days in month
  const generateMonthDays = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      const isoDate = d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      return {
        date: i + 1,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: isoDate,
      };
    });
  };

  // On month/year change, update days and selectedDate
  useEffect(() => {
    const updatedDays = generateMonthDays(currentYear, currentMonthIndex);
    setDays(updatedDays);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonthIndex;

    const defaultSelectedDate = isCurrentMonth
      ? today.toISOString().split('T')[0]
      : updatedDays[0]?.fullDate;

    setSelectedDate(defaultSelectedDate);
  }, [currentMonthIndex, currentYear]);

  // Fetch tasks for the selected date
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem('tasks');
        console.log('Stored tasks:', stored);
        const tasks = stored ? JSON.parse(stored) : [];

        // Debug: log selectedDate and task dates
        console.log('Selected date:', selectedDate);
        tasks.forEach(t => console.log('Task date:', t.date));

        // Filter by date and search text
        const matchingTasks = tasks
          .filter((task) => !selectedDate || task.date === selectedDate)
          .filter((task) =>
            task.title.toLowerCase().includes(searchText.toLowerCase())
          )
          .sort((a, b) => {
            // Safe time parsing
            const parseTime = (t) => {
              if (!t) return 0;
              const [time, period] = t.split(' ');
              let [h, m] = time.split(':').map(Number);
              if (period && period.toLowerCase() === 'pm' && h < 12) h += 12;
              if (period && period.toLowerCase() === 'am' && h === 12) h = 0;
              return h * 60 + m;
            };
            return parseTime(a.startTime) - parseTime(b.startTime);
          });

        setFilteredTasks(matchingTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        Alert.alert('Error', 'Failed to load tasks.');
      }
    };

    fetchTasks();
  }, [selectedDate, searchText]);

  // Toggle task completion
  const toggleTaskCompletion = async (taskId) => {
    try {
      const stored = await AsyncStorage.getItem('tasks');
      const tasks = stored ? JSON.parse(stored) : [];
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setFilteredTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task.');
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Task List</Text>

      <TextInput
        placeholder="Search task"
        placeholderTextColor="#aaa"
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
      />

      <TouchableOpacity onPress={() => setMonthModalVisible(true)} style={styles.monthPicker}>
        <Text style={styles.month}>
          {months[currentMonthIndex]} {currentYear}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#fff" />
      </TouchableOpacity>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateList}
        data={days}
        keyExtractor={(item) => item.fullDate}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={item.fullDate === selectedDate ? styles.selectedDate : styles.dateItem}
            onPress={() => setSelectedDate(item.fullDate)}
          >
            <Text
              style={[
                styles.dateText,
                item.fullDate === selectedDate && { color: '#fff' },
              ]}
            >
              {item.date}
            </Text>
            <Text
              style={[
                styles.dayText,
                item.fullDate === selectedDate && { color: '#fff' },
              ]}
            >
              {item.day}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>Tasks on {formatDate(selectedDate)}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {filteredTasks.length === 0 ? (
        <Text style={{ color: '#aaa', alignSelf: 'center' }}>No tasks for this date.</Text>
      ) : (
        filteredTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
  <View style={styles.leftColumn}>
    <Ionicons name="time-outline" size={18} color="#A78BFA" />
    <Text style={styles.timeText}>
      {task.startTime} - {task.endTime}
    </Text>
  </View>

  <View style={styles.taskContent}>
    <Text
      style={[
        styles.taskName,
        task.completed && { textDecorationLine: 'line-through', color: '#888' },
      ]}
    >
      {task.title}
    </Text>

    <View style={styles.tagRow}>
      <View style={styles.tag}>
        <Text style={styles.tagText}>📌 {task.category}</Text>
      </View>
      <View style={[styles.tag, styles.priorityTag(task.priority)]}>
        <Text style={styles.tagText}>⚡ {task.priority}</Text>
      </View>
    </View>

    {task.description ? (
      <Text style={styles.taskDetail}>📝 {task.description}</Text>
    ) : null}
  </View>

  <TouchableOpacity onPress={() => toggleTaskCompletion(task.id)}>
    <Ionicons
      name={task.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
      size={26}
      color={task.completed ? '#A78BFA' : '#fff'}
    />
  </TouchableOpacity>
</View>

        ))
      )}

      <Modal isVisible={isMonthModalVisible} onBackdropPress={() => setMonthModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Month & Year</Text>
          <View style={styles.monthYearContainer}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthButton,
                  currentMonthIndex === index && styles.selectedMonth,
                ]}
                onPress={() => setCurrentMonthIndex(index)}
              >
                <Text
                  style={[
                    styles.monthText,
                    currentMonthIndex === index && styles.selectedMonthText,
                  ]}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.yearRow}>
            <TouchableOpacity onPress={() => setCurrentYear((prev) => prev - 1)}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.yearText}>{currentYear}</Text>
            <TouchableOpacity onPress={() => setCurrentYear((prev) => prev + 1)}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => setMonthModalVisible(false)}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 20,
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 25,
    alignSelf: 'center',
  },
  searchInput: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#b97cfc',
  },
  month: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  dateList: {
    marginBottom: 20,
  },
  dateItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    alignItems: 'center',
  },
  selectedDate: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    alignItems: 'center',
  },
  dateText: {
    color: '#ccc',
    fontWeight: '600',
    fontSize: 16,
  },
  dayText: {
    color: '#999',
    fontSize: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    color: '#A78BFA',
    fontSize: 14,
  },
  taskCard: {
    flexDirection: 'row',
  backgroundColor: '#1E1E1E',
  borderRadius: 16,
  padding: 16,
  marginBottom: 15,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 3,
  borderWidth: 1,
  borderColor: '#292929',
  },
  leftColumn: {
  alignItems: 'center',
  marginRight: 12,
},
tagRow: {
  flexDirection: 'row',
  gap: 8,
  marginTop: 4,
  flexWrap: 'wrap',
},
  timeBox: {
    width: 100, // Increased width to accommodate start and end time
    marginRight: 12,
  },
  timeText: {
    color: '#aaa',
    fontSize: 14,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDetail: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 2,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  monthYearContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  monthButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333',
    margin: 4,
  },
  selectedMonth: {
    backgroundColor: '#A78BFA',
  },
  monthText: {
    color: '#ccc',
  },
  selectedMonthText: {
    color: '#fff',
    fontWeight: '600',
  },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  yearText: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 10,
  },
  confirmButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tag: {
  backgroundColor: '#333',
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 4,
},
tagText: {
  color: '#ccc',
  fontSize: 12,
},
  priorityTag: (priority) => ({
  backgroundColor:
    priority === 'High'
      ? '#EF4444'
      : priority === 'Medium'
      ? '#FACC15'
      : '#10B981',
}),
});