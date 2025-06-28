import React, { useEffect, useState ,useCallback} from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const TasksScreen = () => {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [ongoingTasks, setOngoingTasks] = useState(0);

  const totalTasks = completedTasks + ongoingTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const storedTasksJSON = await AsyncStorage.getItem('tasks');
          if (storedTasksJSON) {
            const storedTasks = JSON.parse(storedTasksJSON);
            const completed = storedTasks.filter((task: any) => task.completed === true).length;
            const ongoing = storedTasks.filter((task: any) => task.completed === false).length;
            setCompletedTasks(completed);
            setOngoingTasks(ongoing);
          }
        } catch (e) {
          console.log('Error loading task data:', e);
        }
      };

      fetchData();
    }, [])
  );


  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Task Overview</Text>

        <View style={styles.cardContainer}>
          <View style={[styles.card, { backgroundColor: '#B298DC' }]}>
            <Text style={styles.cardValue}>{completedTasks}</Text>
            <Text style={styles.cardLabel}>Completed Tasks</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#F5B17A' }]}>
            <Text style={styles.cardValue}>{ongoingTasks}</Text>
            <Text style={styles.cardLabel}>Ongoing Tasks</Text>
          </View>
        </View>

        <View style={styles.percentageCard}>
          <Text style={styles.percentageTitle}>Completion Rate</Text>
          <Text style={styles.percentageValue}>{completionRate}%</Text>
          <Text style={styles.percentageSub}>
            {completedTasks} of {totalTasks} tasks completed
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default TasksScreen; 



const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    backgroundColor: '#0f0f0f',
    padding: 20,
    flexGrow: 1,
    paddingBottom: 85,
  },
  heading: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 25,
  },
  chartContainer: {
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    height: 150,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  percentageCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  percentageTitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 5,
  },
  percentageValue: {
    color: 'lightgreen',
    fontSize: 32,
    fontWeight: 'bold',
  },
  percentageSub: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 4,
  },
});// Make sure this is the default export
