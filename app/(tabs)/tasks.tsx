import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const Task: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [ongoingTasks, setOngoingTasks] = useState(0);
  const [totalTasksData, setTotalTasksData] = useState<number[]>([]);
  const [dateLabels, setDateLabels] = useState<string[]>([]);

  const totalTasks = completedTasks + ongoingTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Helper function to generate an array of dates for the last N days
  const getDateRange = (endDate: Date, days: number): { dates: Date[]; labels: string[] } => {
    const dates: Date[] = [];
    const labels: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      dates.push(d);
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`); // Format as MM/DD
    }
    return { dates, labels };
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const storedTasksJSON = await AsyncStorage.getItem('tasks');
          if (storedTasksJSON) {
            const storedTasks = JSON.parse(storedTasksJSON);

            // Calculate completed and ongoing tasks
            const completed = storedTasks.filter((task: any) => task.completed === true).length;
            const ongoing = storedTasks.filter((task: any) => task.completed === false).length;
            setCompletedTasks(completed);
            setOngoingTasks(ongoing);

            // Get the last 7 days (including today)
            const today = new Date();
            const { dates, labels } = getDateRange(today, 7);

            // Count tasks for each date
            const tasksByDate = Array(7).fill(0);
            storedTasks.forEach((task: any) => {
              const taskDate = new Date(task.date);
              const taskDateStr = taskDate.toISOString().split('T')[0];
              const index = dates.findIndex(
                (d) => d.toISOString().split('T')[0] === taskDateStr
              );
              if (index !== -1) {
                tasksByDate[index]++;
              }
            });

            setTotalTasksData(tasksByDate);
            setDateLabels(labels);
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

        <Text style={styles.heading}>Total Tasks per Date</Text>

        <View style={styles.chartContainer}>
          <View style={{ height: 250, flexDirection: 'row' }}>
            <YAxis
              data={totalTasksData}
              style={{ marginBottom: 30 }}
              contentInset={{ top: 20, bottom: 20 }}
              svg={{ fill: 'orange', fontSize: 12 }}
              numberOfTicks={6}
              formatLabel={(value: number) => `${value}`}
            />

            <View style={{ flex: 1, marginLeft: 10 }}>
              <LineChart
                style={{ flex: 1 }}
                data={totalTasksData}
                svg={{ stroke: 'orange', strokeWidth: 2 }}
                contentInset={{ top: 20, bottom: 20 }}
                curve={shape.curveNatural}
              >
                <Grid svg={{ stroke: 'orange', strokeOpacity: 0.3 }} />
              </LineChart>
            </View>
          </View>

          <XAxis
            style={{ marginHorizontal: 10, height: 30 }}
            data={totalTasksData}
            formatLabel={(value, index) => dateLabels[index] || ''}
            contentInset={{ left: 20, right: 20 }}
            svg={{ fill: 'orange', fontSize: 12 }}
          />
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

export default Task;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
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
});