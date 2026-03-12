import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import EventCard from '../Components/event/EventCard';
import styles from '../styles/EventListScreenStyle';
import { StackNavigationProp } from '@react-navigation/stack';
import { EventsStackParamList } from '../types/navigation';
import { API_URL } from '../api/config';

type EventsListNavigationProp = StackNavigationProp<
  EventsStackParamList,
  'EventsList'
>;

const EventsListScreen = () => {
  const navigation = useNavigation<EventsListNavigationProp>();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('disponibles');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      let endpoint = `${API_URL}/events`;

      if (filter === 'disponibles') {
        endpoint = `${API_URL}/events/active`;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const eventData = response.data.data; 

      let filteredEvents = eventData;

      if (filter === 'proximos') {
        const now = new Date();
        filteredEvents = eventData.filter(
          (event: any) => new Date(event.fechaInicio) > now
        );
      }

      setEvents(filteredEvents);

    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleEventPress = (event) => {
    navigation.navigate('EventDetail', { eventId: event._id });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            styles.filterButtonIcon,
            filter === 'todos' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('todos')}
          activeOpacity={0.7}
        >
          <Icon 
            name="menu-outline" 
            size={20} 
            color={filter === 'todos' ? '#fff' : '#666'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'disponibles' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('disponibles')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'disponibles' && styles.filterTextActive,
            ]}
          >
            Disponibles
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="calendar-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No hay eventos</Text>
      <Text style={styles.emptyText}>
        {filter === 'disponibles'
          ? 'No hay eventos con cupos disponibles'
          : filter === 'proximos'
          ? 'No hay eventos próximos programados'
          : 'No hay eventos registrados'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => handleEventPress(item)} />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default EventsListScreen;