import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/TicketScreenStyles';
import { RouteProp } from '@react-navigation/native';
import { EventsStackParamList } from '../types/navigation';
import { API_URL } from '../api/config';
import { StackNavigationProp } from '@react-navigation/stack';

type TicketRouteProp = RouteProp<EventsStackParamList, 'Ticket'>;
type TicketNavigationProp = StackNavigationProp<EventsStackParamList, 'Ticket'>;

const TicketScreen = () => {
  const route = useRoute<TicketRouteProp>();
  const navigation = useNavigation<TicketNavigationProp>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<any>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketData();
  }, []);

  const fetchTicketData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Sesión Requerida', 'Debes iniciar sesión para ver tu boleto', [{
          text: 'Iniciar Sesión',
          onPress: () => navigation.navigate('Auth' as any, { screen: 'Login' })
        }]);
        return;
      }

      const eventResponse = await axios.get(
        `${API_URL}/events/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvent(eventResponse.data.data);

      const userId = await AsyncStorage.getItem('userId');
      const invitationsResponse = await axios.get(
        `${API_URL}/invitaciones/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const invitations = invitationsResponse.data.data;
      const userInvitation = invitations.find(
        (inv: any) => inv.evento === eventId || inv.evento?._id === eventId
      );

      if (!userInvitation) {
        Alert.alert(
          'Boleto No Encontrado',
          'No tienes un boleto para este evento. ¿Deseas registrarte?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => navigation.goBack() },
            { text: 'Registrarse', onPress: () => navigation.navigate('EventDetail', { eventId }) }
          ]
        );
        return;
      }

      setInvitation(userInvitation);
    } catch (error: any) {
      console.error('Error fetching ticket:', error.response?.data);
      Alert.alert('Error', 'No se pudo cargar el boleto. Por favor intenta de nuevo.', [
        { text: 'Volver', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    });
  };

  const formatDateRange = (startDate: string) => {
    const start = new Date(startDate);
    const startDay = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    if (startDay.getTime() === startDay.getTime()) return formatDate(startDate);
    return `Del ${formatDate(startDate)} al ${formatDate(startDate)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceptada': return '#4caf50';
      case 'enviada':  return '#ff9800';
      case 'rechazada': return '#f44336';
      case 'caducada': return '#999';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aceptada': return 'Confirmado';
      case 'enviada':  return 'Pendiente';
      case 'rechazada': return 'Rechazado';
      case 'caducada': return 'Caducado';
      default: return status;
    }
  };

  const getAttendanceStatusText = (status: string) => {
    switch (status) {
      case 'asistio': return 'Asistencia Confirmada';
      case 'no_asistio': return 'No Asistió';
      case 'pendiente': return 'Pendiente de Asistir';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingText}>Cargando boleto...</Text>
      </View>
    );
  }

  if (!event || !invitation) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>No se pudo cargar el boleto</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Espacio populado o null
  const espacio = event.espacio && typeof event.espacio === 'object' ? event.espacio : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="ticket" size={48} color="#1a1a1a" />
          </View>
          <Text style={styles.headerTitle}>Tu Boleto de Evento</Text>
          <Text style={styles.headerSubtitle}>Presenta este código QR al llegar al evento</Text>
        </View>

        {/* Event Info */}
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>{event.titulo}</Text>

          {/* Fecha */}
          <View style={styles.eventInfo}>
            <View style={styles.eventInfoIconContainer}>
              <Ionicons name="calendar-outline" size={18} color="#1a1a1a" />
            </View>
            <View style={styles.eventInfoContent}>
              <Text style={styles.eventInfoLabel}>Fecha</Text>
              <Text style={styles.eventInfoValue}>
                {formatDateRange(event.fecha)}
              </Text>
            </View>
          </View>

          {/* Horario */}
          <View style={styles.eventInfo}>
            <View style={styles.eventInfoIconContainer}>
              <Ionicons name="time-outline" size={18} color="#1a1a1a" />
            </View>
            <View style={styles.eventInfoContent}>
              <Text style={styles.eventInfoLabel}>Horario</Text>
              <Text style={styles.eventInfoValue}>{event.horaInicio} - {event.horaFin}</Text>
            </View>
          </View>

          {/* Lugar */}
          <View style={styles.eventInfo}>
            <View style={styles.eventInfoIconContainer}>
              <Ionicons name="location-outline" size={18} color="#1a1a1a" />
            </View>
            <View style={styles.eventInfoContent}>
              <Text style={styles.eventInfoLabel}>Lugar</Text>
              <Text style={styles.eventInfoValue}>
                {event.destino?.nombre || 'No especificado'}
              </Text>
            </View>
          </View>

          {/* Espacio / Salón */}
          {espacio && (
            <View style={styles.eventInfo}>
              <View style={styles.eventInfoIconContainer}>
                <Ionicons name="business-outline" size={18} color="#1a1a1a" />
              </View>
              <View style={styles.eventInfoContent}>
                <Text style={styles.eventInfoLabel}>Espacio / Salón</Text>
                <Text style={styles.eventInfoValue}>
                  {espacio.nombre}{espacio.planta ? ` · Planta ${espacio.planta}` : ''}
                </Text>
                {espacio.descripcion ? (
                  <Text style={[styles.eventInfoValue, { fontSize: 12, color: '#888', marginTop: 2 }]}>
                    {espacio.descripcion}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        </View>

        {/* QR Code */}
        <View style={styles.qrCard}>
          <View style={styles.qrContainer}>
            {invitation.qrCode ? (
              <QRCode value={invitation.token} size={220} backgroundColor="#fff" color="#1a1a1a" />
            ) : (
              <View style={styles.qrPlaceholder}>
                <ActivityIndicator size="large" color="#1a1a1a" />
                <Text style={styles.qrPlaceholderText}>Generando QR...</Text>
              </View>
            )}
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invitation.estadoInvitacion) }]}>
              <Text style={styles.statusText}>{getStatusText(invitation.estadoInvitacion)}</Text>
            </View>
            {invitation.estadoAsistencia === 'asistio' && (
              <View style={[styles.statusBadge, { backgroundColor: '#4caf50', marginTop: 8 }]}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" style={styles.statusIcon} />
                <Text style={styles.statusText}>{getAttendanceStatusText(invitation.estadoAsistencia)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="list-outline" size={20} color="#1a1a1a" />
            <Text style={styles.instructionsTitle}>Instrucciones</Text>
          </View>
          {[
            'Llega 15 minutos antes del evento',
            'Presenta este código QR en la entrada',
            'El personal escaneará tu boleto',
            '¡Disfruta el evento!',
          ].map((text, i) => (
            <View key={i} style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.instructionsText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Token */}
        <View style={styles.tokenCard}>
          <Text style={styles.tokenLabel}>Token de verificación</Text>
          <Text style={styles.tokenValue}>{invitation.token}</Text>
          <Text style={styles.tokenHint}>Este código también puede ser ingresado manualmente</Text>
        </View>

        {/* Metadata */}
        <View style={styles.metadataCard}>
          <Text style={styles.metadataTitle}>Información del Boleto</Text>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Fecha de Registro</Text>
            <Text style={styles.metadataValue}>
              {new Date(invitation.fechaEnvio).toLocaleDateString('es-MX')}
            </Text>
          </View>
          {invitation.fechaRespuesta && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Fecha de Confirmación</Text>
              <Text style={styles.metadataValue}>
                {new Date(invitation.fechaRespuesta).toLocaleDateString('es-MX')}
              </Text>
            </View>
          )}
          {invitation.fechaUsoToken && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Fecha de Uso</Text>
              <Text style={styles.metadataValue}>
                {new Date(invitation.fechaUsoToken).toLocaleString('es-MX')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default TicketScreen;