import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { styles } from "../../styles/LocationInformationStyle";

interface LocationInformationProps {
    location?: {
        // Location fields
        nombre: string;
        direccion?: string;
        telefono?: string;
        horario?: string;
        sitioWeb?: string;
        calificacion?: number;
        totalResenas?: number;
        descripcion?: string;
        tipo?: string;
        fotos?: string[];
        posicion?: {
            latitude: number;
            longitude: number;
        };
        // Person fields (when isPerson = true)
        isPerson?: boolean;
        numeroEmpleado?: string;
        nombreCompleto?: string;
        email?: string;
        cargo?: string;
        departamento?: string;
        cubiculo?: string;
        planta?: string;
    } | null;
    onClose: () => void;
}

const LocationInformation: React.FC<LocationInformationProps> = ({ location, onClose }) => {

    // ── Shared header ──────────────────────────────────────────────────────────
    const Header = ({ title }: { title: string }) => (
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#5F6368" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 28 }} />
        </View>
    );

    // ── Empty state ────────────────────────────────────────────────────────────
    if (!location) {
        return (
            <View style={styles.container}>
                <Header title="Información del lugar" />
                <View style={styles.emptyState}>
                    <Ionicons name="location-outline" size={64} color="#DDD" />
                    <Text style={styles.emptyText}>No hay información disponible</Text>
                </View>
            </View>
        );
    }

    // ── PERSON view ────────────────────────────────────────────────────────────
    if (location.isPerson) {
        const handleCall = () => {
            if (location.telefono) Linking.openURL(`tel:${location.telefono}`);
        };
        const handleEmail = () => {
            if (location.email) Linking.openURL(`mailto:${location.email}`);
        };
        const handleDirections = () => {
            if (location.posicion) {
                Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${location.posicion.latitude},${location.posicion.longitude}`
                );
            }
        };

        return (
            <View style={styles.container}>
                <Header title="Información del Personal" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                    {/* Avatar */}
                    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                        <View style={{
                            width: 90, height: 90, borderRadius: 45,
                            backgroundColor: '#EEF2FF',
                            justifyContent: 'center', alignItems: 'center',
                            marginBottom: 12,
                        }}>
                            <Ionicons name="person" size={48} color="#4285F4" />
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' }}>
                            {location.nombreCompleto}
                        </Text>
                        <View style={{
                            marginTop: 6, paddingHorizontal: 12, paddingVertical: 4,
                            backgroundColor: '#E8F0FE', borderRadius: 20,
                        }}>
                            <Text style={{ fontSize: 13, color: '#4285F4', fontWeight: '600' }}>
                                {location.cargo}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                            No. Empleado: {location.numeroEmpleado}
                        </Text>
                    </View>

                    {/* Departamento */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="business" size={20} color="#4285F4" />
                            <Text style={styles.sectionTitle}>Departamento</Text>
                        </View>
                        <Text style={styles.infoText}>{location.departamento}</Text>
                    </View>

                    {/* Ubicación física */}
                    {(location.planta || location.cubiculo) && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="location" size={20} color="#4285F4" />
                                <Text style={styles.sectionTitle}>Ubicación Física</Text>
                            </View>
                            {location.planta && (
                                <Text style={styles.infoText}>📍 {location.planta}</Text>
                            )}
                            {location.cubiculo && (
                                <Text style={styles.infoText}>🚪 Cubículo {location.cubiculo}</Text>
                            )}
                        </View>
                    )}

                    {/* Edificio */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="school" size={20} color="#4285F4" />
                            <Text style={styles.sectionTitle}>Edificio</Text>
                        </View>
                        <Text style={styles.infoText}>{location.nombre}</Text>
                    </View>

                    {/* Contacto */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="mail" size={20} color="#4285F4" />
                            <Text style={styles.sectionTitle}>Contacto</Text>
                        </View>
                        {location.email && (
                            <TouchableOpacity
                                onPress={handleEmail}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}
                            >
                                <Ionicons name="mail-outline" size={18} color="#5F6368" />
                                <Text style={{ color: '#4285F4', fontSize: 14 }}>{location.email}</Text>
                            </TouchableOpacity>
                        )}
                        {location.telefono && (
                            <TouchableOpacity
                                onPress={handleCall}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}
                            >
                                <Ionicons name="call-outline" size={18} color="#5F6368" />
                                <Text style={{ color: '#4285F4', fontSize: 14 }}>{location.telefono}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Action buttons */}
                    <View style={[styles.actionsContainer, { marginBottom: 32 }]}>
                        {location.telefono && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                                <Ionicons name="call" size={24} color="#4285F4" />
                                <Text style={styles.actionButtonText}>Llamar</Text>
                            </TouchableOpacity>
                        )}
                        {location.email && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
                                <Ionicons name="mail" size={24} color="#4285F4" />
                                <Text style={styles.actionButtonText}>Email</Text>
                            </TouchableOpacity>
                        )}
                        {location.posicion && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
                                <Ionicons name="navigate" size={24} color="#4285F4" />
                                <Text style={styles.actionButtonText}>Cómo llegar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </ScrollView>
            </View>
        );
    }

    // ── LOCATION view ──────────────────────────────────────────────────────────
    const handleCallPress = () => {
        if (location.telefono) Linking.openURL(`tel:${location.telefono}`);
    };
    const handleWebsitePress = () => {
        if (location.sitioWeb) Linking.openURL(location.sitioWeb);
    };
    const handleDirectionsPress = () => {
        if (location.posicion) {
            Linking.openURL(
                `https://www.google.com/maps/dir/?api=1&destination=${location.posicion.latitude},${location.posicion.longitude}`
            );
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Ionicons key={i} name="star" size={16} color="#FBBC04" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Ionicons key={i} name="star-half" size={16} color="#FBBC04" />);
            } else {
                stars.push(<Ionicons key={i} name="star-outline" size={16} color="#FBBC04" />);
            }
        }
        return stars;
    };

    // Check if location has any displayable info beyond just a name + coords
    const hasInfo = location.direccion || location.horario || location.descripcion ||
        location.telefono || location.sitioWeb || location.calificacion ||
        (location.fotos && location.fotos.length > 0);

    return (
        <View style={styles.container}>
            <Header title="Información del lugar" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {location.fotos && location.fotos.length > 0 && (
                    <ScrollView horizontal style={styles.photosContainer} showsHorizontalScrollIndicator={false}>
                        {location.fotos.map((foto, index) => (
                            <Image key={index} source={{ uri: foto }} style={styles.photo} />
                        ))}
                    </ScrollView>
                )}

                <View style={styles.section}>
                    <Text style={styles.placeName}>{location.nombre}</Text>
                    {location.tipo && (
                        <View style={styles.typeTag}>
                            <Text style={styles.typeText}>{location.tipo}</Text>
                        </View>
                    )}
                </View>

                {location.calificacion && (
                    <View style={styles.ratingSection}>
                        <View style={styles.starsContainer}>
                            {renderStars(location.calificacion)}
                        </View>
                        <Text style={styles.ratingText}>{location.calificacion.toFixed(1)}</Text>
                        {location.totalResenas && (
                            <Text style={styles.reviewsText}>({location.totalResenas} reseñas)</Text>
                        )}
                    </View>
                )}

                {location.descripcion && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="information-circle" size={20} color="#4285F4" />
                            <Text style={styles.sectionTitle}>Descripción</Text>
                        </View>
                        <Text style={styles.descriptionText}>{location.descripcion}</Text>
                    </View>
                )}

                {location.direccion && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location" size={20} color="#4285F4" />
                            <Text style={styles.sectionTitle}>Dirección</Text>
                        </View>
                        <Text style={styles.infoText}>{location.direccion}</Text>
                    </View>
                )}

                {location.horario && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="time" size={20} color="#4285F4" />
                            <Text style={styles.sectionTitle}>Horario</Text>
                        </View>
                        <Text style={styles.infoText}>{location.horario}</Text>
                    </View>
                )}

                {/* If location has no extra info, show coordinates at minimum */}
                {!hasInfo && location.posicion && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="map" size={20} color="#4285F4" />
                            <Text style={styles.sectionTitle}>Coordenadas</Text>
                        </View>
                        <Text style={styles.infoText}>
                            Lat: {location.posicion.latitude.toFixed(6)}{"\n"}
                            Lng: {location.posicion.longitude.toFixed(6)}
                        </Text>
                    </View>
                )}

                <View style={styles.actionsContainer}>
                    {location.telefono && (
                        <TouchableOpacity style={styles.actionButton} onPress={handleCallPress}>
                            <Ionicons name="call" size={24} color="#4285F4" />
                            <Text style={styles.actionButtonText}>Llamar</Text>
                        </TouchableOpacity>
                    )}
                    {location.sitioWeb && (
                        <TouchableOpacity style={styles.actionButton} onPress={handleWebsitePress}>
                            <Ionicons name="globe" size={24} color="#4285F4" />
                            <Text style={styles.actionButtonText}>Sitio web</Text>
                        </TouchableOpacity>
                    )}
                    {location.posicion && (
                        <TouchableOpacity style={styles.actionButton} onPress={handleDirectionsPress}>
                            <Ionicons name="navigate" size={24} color="#4285F4" />
                            <Text style={styles.actionButtonText}>Cómo llegar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {location.posicion && (
                    <View style={styles.coordinatesSection}>
                        <Text style={styles.coordinatesText}>
                            Lat: {location.posicion.latitude.toFixed(6)}, Lng: {location.posicion.longitude.toFixed(6)}
                        </Text>
                    </View>
                )}

            </ScrollView>
        </View>
    );
};

export default LocationInformation;