import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
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

  const generateMonthDays = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      const isoDate = d.toISOString().split('T')[0];
      return {
        date: i + 1,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: isoDate,
      };
    });
  };

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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem('tasks');
        const tasks = stored ? JSON.parse(stored) : [];

        const matchingTasks = tasks
          .filter((task) => task.date === selectedDate)
          .sort((a, b) => {
            // Convert 12-hour time to 24-hour for sorting
            const timeA = new Date(`1970-01-01 ${a.startTime}`).getTime();
            const timeB = new Date(`1970-01-01 ${b.startTime}`).getTime();
            return timeA - timeB;
          });

        setFilteredTasks(matchingTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    if (selectedDate) {
      fetchTasks();
    }
  }, [selectedDate]);

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
    }
  };

  const formatDate = (dateStr) => {
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
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>
                {task.startTime} - {task.endTime}
              </Text>
            </View>
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskName,
                  task.completed && { textDecorationLine: 'line-through', color: '#aaa' },
                ]}
              >
                {task.title}
              </Text>
              <Text style={styles.taskDetail}>📌 {task.category}</Text>
              <Text style={styles.taskDetail}>⚡ {task.priority}</Text>
              {task.description && (
                <Text style={styles.taskDetail}>📝 {task.description}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => toggleTaskCompletion(task.id)}>
              <Ionicons
                name={task.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={24}
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
});