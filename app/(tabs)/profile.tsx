import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';


export default function Profile() {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const navigation = useNavigation();
  const router = useRouter(); 

  useEffect(() => {
    const fetchData = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      const storedImage = await AsyncStorage.getItem('profileImage');
      if (storedName) setUsername(storedName);
      if (storedImage) setProfileImage(storedImage);
    };
    fetchData();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission is required to access the gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await AsyncStorage.setItem('profileImage', uri);
    }
  };


  const renderAvatar = () => {
  return (
    <View style={{ position: 'relative' }}>
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholderAvatar]}>
          <Text style={styles.avatarInitial}>
            {username.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
      )}
      <TouchableOpacity
        onPress={pickImage}
        style={styles.cameraIconWrapper}
        activeOpacity={0.8}
      >
        <Ionicons name="camera" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Avatar and Info */}
      <View style={styles.profileSection}>
        {renderAvatar()}
        <Text style={styles.name}>{username}</Text>
      </View>

      {/* Menu Buttons */}
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="person-outline" size={20} color="#b97cfc" style={styles.icon} />
        <Text style={styles.menuText}>Account Details</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton}>
        <MaterialIcons name="insert-chart-outlined" size={20} color="#b97cfc" style={styles.icon} />
        <Text style={styles.menuText}>Challenge Statistics</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="color-palette-outline" size={20} color="#b97cfc" style={styles.icon} />
        <Text style={styles.menuText}>Change Theme</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton}>
        <Feather name="globe" size={20} color="#b97cfc" style={styles.icon} />
        <Text style={styles.menuText}>Language Preferences</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton}>
        <FontAwesome5 name="headset" size={20} color="#b97cfc" style={styles.icon} />
        <Text style={styles.menuText}>Contact Support</Text>
      </TouchableOpacity>

<TouchableOpacity
  style={styles.menuButton}
  onPress={async () => {
    try {
      await AsyncStorage.removeItem('userName');
      await AsyncStorage.removeItem('profileImage');
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  }}
>
  <Ionicons name="log-out-outline" size={20} color="#b97cfc" style={styles.icon} />
  <Text style={styles.menuText}>Logout</Text>
</TouchableOpacity>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#b97cfc',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#444',
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#121212',
  },
  name: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
  tagline: {
    marginTop: 40,
    color: '#666',
    fontSize: 13,
  },
  cameraIconWrapper: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: '#a864f3',
  borderRadius: 15,
  padding: 6,
  borderWidth: 2,
  borderColor: '#121212',
},

});
