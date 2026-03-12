import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/EventCardStyle';

const API_BASE_URL = 'http://192.168.100.42:3000';

const EventCard = ({ event, onPress }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
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
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
  };

  const cuposPercentage = (event.cuposDisponibles / event.cupos) * 100;
  
  const getCuposColor = () => {
    if (cuposPercentage <= 20) return '#f44336';
    if (cuposPercentage <= 50) return '#ff9800';
    return '#4caf50';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}/${imagePath}`;
  };

  const imageUrl = getImageUrl(event.image);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
            onError={(error) => {
              console.log('Error cargando imagen del evento:', imageUrl);
            }}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="calendar-outline" size={56} color="#bbb" />
          </View>
        )}
        
        {event.activo ? (
          <View style={styles.badgeOverlay}>
            <Text style={styles.badgeOverlayText}>Activo</Text>
          </View>
        ) : (
          <View style={[styles.badgeOverlay, styles.badgeOverlayInactive]}>
            <Text style={[styles.badgeOverlayText, styles.badgeOverlayTextInactive]}>
              Inactivo
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {event.titulo}
        </Text>
        
        <Text style={styles.dateText} numberOfLines={2}>
          {formatDateRange(event.fechaInicio, event.fechaFin)}
        </Text>

        <View style={styles.infoRow}>
          <Icon name="location-outline" size={14} color="#666" style={styles.infoIcon} />
          <Text style={styles.location} numberOfLines={1}>
            {event.destino?.nombre || 'Ubicación no especificada'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="time-outline" size={14} color="#666" style={styles.infoIcon} />
          <Text style={styles.time} numberOfLines={1}>
            {event.horaInicio} - {event.horaFin}
          </Text>
        </View>

        <View style={styles.cuposContainer}>
          <View
            style={[
              styles.cuposIndicator,
              { backgroundColor: getCuposColor() },
            ]}
          />
          <Text style={styles.cuposText}>
            {event.cuposDisponibles} de {event.cupos} disponibles
          </Text>
        </View>

        <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
          <Text style={styles.detailsButtonText}>Ver detalles</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;