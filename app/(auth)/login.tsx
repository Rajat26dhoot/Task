import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Redirect } from 'expo-router';


const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const checkUserName = async () => {
      try {
        const userName = await AsyncStorage.getItem('userName');
        if (userName) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.log('Error checking username:', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserName();
  }, []);

  const handleSaveName = async () => {
    if (name.trim() === '') {
      Alert.alert('Name is required');
      return;
    }
    try {
      await AsyncStorage.setItem('userName', name);
      router.replace('(tabs)');
    } catch (e) {
      Alert.alert('Failed to save name');
    }
  };

  if (isLoading) {
    return null; // Or a loading indicator if preferred
  }

  if (isLoggedIn) {
    return <Redirect href="(tabs)" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Top logo and app name */}
            <View style={styles.header}>
              <Image
                source={require('../../assets/applogo.png')}
                style={styles.appLogo}
                resizeMode="contain"
              />
              <Text style={styles.appTitle}>TaskNest</Text>
            </View>

            {/* Main illustration image */}
            <Image
              source={require('../../assets/loginscreen.png')}
              style={styles.illustration}
              resizeMode="contain"
            />

            <Text style={styles.title}>
              Organize your{'\n'}work and life, finally
            </Text>

            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#ccc"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveName}>
              <Text style={styles.saveButtonText}>Get Started</Text>
            </TouchableOpacity>

            <Text style={styles.bText}>
              By continuing, you agree to{' '}
              <Text style={styles.bLink}>Terms of Service</Text> and{' '}
              <Text style={styles.bLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appLogo: {
    width: 27,
    height: 27,
    marginRight: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  appTitle: {
    color: '#c088fc',
    fontSize: 27,
    fontWeight: '700',
  },
  illustration: {
    width: width,
    height: height * 0.5,
    marginBottom: 8,
    alignSelf: 'center',
    marginTop: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: 'white',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#b97cfc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 30,
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#c088fc',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  bText: {
    color: '#aaa',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 15,
    marginHorizontal: 40,
  },
  bLink: {
    color: '#a864f3',
    fontWeight: '600',
  },
});