import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/EventCardStyle';

const API_BASE_URL = 'https://uteq-connect-server-production.up.railway.app';

const EventCard = ({ event, onPress }) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const cuposPercentage = (event.cuposDisponibles / event.cupos) * 100;

  const getCuposColor = () => {
    if (cuposPercentage <= 20) return '#f44336';
    if (cuposPercentage <= 50) return '#ff9800';
    return '#4caf50';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.includes('cloudinary.com')) {
      return `https://${imagePath}`;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const imageUrl = getImageUrl(event.image);
  const showImage = imageUrl && !imageError;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {showImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
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

        <Text style={styles.dateText} numberOfLines={1}>
          {formatDate(event.fecha)}
        </Text>

        <View style={styles.infoRow}>
          <Icon name="location-outline" size={14} color="#666" style={styles.infoIcon} />
          <Text style={styles.location} numberOfLines={1}>
            {typeof event.destino === 'object' && event.destino?.nombre
              ? event.destino.nombre
              : 'Ubicación no especificada'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="time-outline" size={14} color="#666" style={styles.infoIcon} />
          <Text style={styles.time} numberOfLines={1}>
            {event.horaInicio} - {event.horaFin}
          </Text>
        </View>

        <View style={styles.cuposContainer}>
          <View style={[styles.cuposIndicator, { backgroundColor: getCuposColor() }]} />
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