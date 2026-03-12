import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../styles/EventDetailScreenStyles';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { EventsStackParamList } from '../types/navigation';
import { API_URL } from '../api/config';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const API_BASE_URL = 'http://192.168.100.42:3000';

type EventDetailRouteProp = RouteProp<EventsStackParamList, 'EventDetail'>;
type EventDetailNavigationProp = StackNavigationProp<EventsStackParamList, 'EventDetail'>;

const EventDetailScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const navigation = useNavigation<EventDetailNavigationProp>();
  const route = useRoute<EventDetailRouteProp>();
  const { eventId } = route.params;
  
  const [event, setEvent] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useFocusEffect(
    useCallback(() => {
      checkAuthAndFetchEvent();
    }, [])
  );

  const checkAuthAndFetchEvent = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const storedUserId = await AsyncStorage.getItem('userId');

      setIsAuthenticated(!!token);
      setUserId(storedUserId);

      await fetchEventDetails(token, storedUserId);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      await fetchEventDetails(null, null);
    }
  };

  const fetchEventDetails = async (tokenParam?: string | null, userIdParam?: string | null) => {
    try {
      const token = tokenParam || await AsyncStorage.getItem('userToken');
      const currentUserId = userIdParam || await AsyncStorage.getItem('userId');

      const eventResponse = await axios.get(
        `${API_URL}/events/${eventId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      setEvent(eventResponse.data.data);

      if (token && currentUserId) {
        try {
          const invitationsResponse = await axios.get(
            `${API_URL}/invitaciones/user/${currentUserId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const invitations = invitationsResponse.data.data;
          const userInvitation = invitations.find(
            (inv: any) => inv.evento?._id === eventId
          );

          if (userInvitation) {
            setInvitation(userInvitation);
          } else {
            setInvitation(null);
          }
        } catch (error) {
          console.log('No invitation found');
          setInvitation(null);
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'No se pudo cargar el evento');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      Alert.alert(
        'Registro Requerido',
        'Debes iniciar sesión en la aplicación para poder registrarte a este evento.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Iniciar Sesión',
            onPress: () => {
              navigation.navigate('Auth' as any, { screen: 'Login' });
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Confirmar Registro',
      `¿Deseas registrarte para "${event?.titulo || 'este evento'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setRegistering(true);
            try {
              const url = `${API_URL}/invitaciones/event/${eventId}/register`;

              const response = await axios.post(
                url,
                {},
                { 
                  headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  } 
                }
              );

              Alert.alert(
                '¡Registro Exitoso!',
                'Te has registrado correctamente al evento. Se ha enviado tu boleto a tu correo electrónico.',
                [
                  {
                    text: 'Ver Mi Boleto',
                    onPress: () => {
                      const newInvitation = response.data.data.invitation;
                      setInvitation(newInvitation);
                      navigation.navigate('Ticket', { eventId });
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('❌ Error registering:', error);
              
              if (error.response?.status === 401 || error.response?.data?.requiresAuth) {
                Alert.alert(
                  'Sesión Expirada',
                  'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
                  [
                    {
                      text: 'Iniciar Sesión',
                      onPress: () => {
                        AsyncStorage.removeItem('userToken');
                        navigation.navigate('Auth' as any, { screen: 'Login' });
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Error',
                  error.response?.data?.error || 
                  error.response?.data?.message || 
                  'No se pudo completar el registro. Por favor intenta de nuevo.'
                );
              }
            } finally {
              setRegistering(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startDay = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const endDay = new Date(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
    
    if (startDay.getTime() === endDay.getTime()) {
      return formatDate(startDate);
    } else {
      return `${formatDate(startDate)} hasta ${formatDate(endDate)}`;
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}/${imagePath}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingText}>Cargando evento...</Text>
      </View>
    );
  }

  // ✅ Verificar si event existe antes de renderizar
  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.loadingText}>No se pudo cargar el evento</Text>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.registerButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUrl = getImageUrl(event.image);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header con imagen */}
        <View style={styles.headerImage}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.eventHeaderImage}
              resizeMode="cover"
              onError={(error) => {
                console.log('Error cargando imagen del evento:', imageUrl);
              }}
            />
          ) : (
            <View style={styles.headerImagePlaceholder}>
              <Icon name="calendar" size={80} color="#bbb" />
            </View>
          )}
          
          {event.activo && (
            <View style={styles.statusBadge}>
              <Icon name="checkmark-circle" size={16} color="#fff" style={styles.statusIcon} />
              <Text style={styles.statusText}>Evento Activo</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{event.titulo}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="calendar-outline" size={20} color="#1a1a1a" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>
                  {formatDateRange(event.fechaInicio, event.fechaFin)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="time-outline" size={20} color="#1a1a1a" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Horario</Text>
                <Text style={styles.infoValue}>
                  {event.horaInicio} - {event.horaFin}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="location-outline" size={20} color="#1a1a1a" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Ubicación</Text>
                <Text style={styles.infoValue}>
                  {event.destino?.nombre || 'No especificada'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="people-outline" size={20} color="#1a1a1a" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Disponibilidad</Text>
                <Text style={styles.infoValue}>
                  {event.cuposDisponibles} de {event.cupos} cupos disponibles
                </Text>
              </View>
            </View>
          </View>

          {event.descripcion && (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>Descripción</Text>
              <Text style={styles.descriptionText}>{event.descripcion}</Text>
            </View>
          )}

          {!isAuthenticated && (
            <View style={styles.authNoticeCard}>
              <Icon name="lock-closed-outline" size={40} color="#f57c00" style={styles.authNoticeIcon} />
              <Text style={styles.authNoticeTitle}>Inicia Sesión para Registrarte</Text>
              <Text style={styles.authNoticeText}>
                Necesitas tener una cuenta e iniciar sesión para poder registrarte a este evento.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!invitation && event.activo && event.cuposDisponibles > 0 ? (
          <TouchableOpacity
            style={[styles.registerButton, registering && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={registering}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>
              {registering ? 'Registrando...' : isAuthenticated ? 'Confirmar Registro' : 'Iniciar Sesión para Registrarse'}
            </Text>
          </TouchableOpacity>
        ) : invitation ? (
          <TouchableOpacity
            style={styles.ticketButton}
            onPress={() => navigation.navigate('Ticket', { eventId })}
            activeOpacity={0.8}
          >
            <Icon name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.ticketButtonText}>Ver Mi Boleto</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.unavailableContainer}>
            <Text style={styles.unavailableText}>
              {!event.activo
                ? 'Este evento no está activo'
                : 'No hay cupos disponibles'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default EventDetailScreen;