import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/HomeScreenStyle';
import api from '../api/axios';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import Most_visited from '../Components/most_visited/Most_visited';
import CalendarSection from '../Components/event/CalendarSection';

type HomeScreenProps = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'HomeTab'>;
  setIsLoggedIn: (value: boolean) => void;
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

const API_BASE_URL = 'http://192.168.100.42:3000';

const HomeScreen = ({ navigation, setIsLoggedIn }: HomeScreenProps) => {
  const [destinations, setDestinations] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadUserData();
    fetchDestinations();
  }, []);

  const loadUserData = async () => {
    try {
      const userName = await AsyncStorage.getItem('userName');
      setUserName(userName || 'Usuario');
    } catch (error) {
      setUserName('Usuario');
    }
  };

  const FEATURED_DESTINATION_IDS = ['6', '25', '12', '16', '38', '17'];

  const fetchDestinations = async () => {
    try {
      const response = await api.get('/locations');
      const allData = response.data.data;
      const filteredDestinations = allData.filter((destination: any) =>
        FEATURED_DESTINATION_IDS.includes(destination.id)
      );
      const sortedDestinations = FEATURED_DESTINATION_IDS
        .map(id => filteredDestinations.find((d: any) => d.id === id))
        .filter(dest => dest !== undefined);
      setDestinations(sortedDestinations);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los destinos');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDestinations();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'userToken', 'userId', 'userEmail', 'userName', 'userRol'
      ]);
      setIsLoggedIn(false);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola </Text>
            <Text style={styles.title}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={{ color: '#1e3a5f', fontWeight: '700' }}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Most_visited />

        <CalendarSection
          onEventPress={(event) =>
            navigation.navigate('EventosTab' as any, {
              screen: 'EventDetail',
              params: { eventId: event._id },
            })
          }
          onVerTodos={() => navigation.navigate('EventosTab' as any)}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;