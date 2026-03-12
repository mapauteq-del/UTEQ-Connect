import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Modal } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { styles } from "../../styles/PersonInformationStyle";

interface PersonInformationProps {
    person?: {
        numeroEmpleado: string;
        nombreCompleto: string;
        email: string;
        telefono: string;
        cargo: string;
        departamento: string;
        cubiculo?: string;
        planta?: string;
        ubicacion?: {
            nombre: string;
            coordenadas: {
                latitude: number;
                longitude: number;
            };
        };
    } | null;
    visible: boolean;       // ← nuevo prop requerido
    onClose: () => void;
}

const PersonInformation: React.FC<PersonInformationProps> = ({ person, visible, onClose }) => {
    const handleCallPress = () => {
        if (person?.telefono) {
            Linking.openURL(`tel:${person.telefono}`);
        }
    };

    const handleEmailPress = () => {
        if (person?.email) {
            Linking.openURL(`mailto:${person.email}`);
        }
    };

    const handleDirectionsPress = () => {
        if (person?.ubicacion?.coordenadas) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${person.ubicacion.coordenadas.latitude},${person.ubicacion.coordenadas.longitude}`;
            Linking.openURL(url);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#5F6368" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Información del Personal</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    {!person ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#999' }}>Sin información disponible</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                            {/* Avatar */}
                            <View style={styles.avatarSection}>
                                <View style={styles.avatarCircle}>
                                    <Ionicons name="person" size={48} color="#4285F4" />
                                </View>
                            </View>

                            {/* Nombre y cargo */}
                            <View style={styles.section}>
                                <Text style={styles.personName}>{person.nombreCompleto}</Text>
                                <View style={styles.cargoTag}>
                                    <Text style={styles.cargoText}>{person.cargo}</Text>
                                </View>
                                <Text style={styles.employeeNumber}>
                                    No. Empleado: {person.numeroEmpleado}
                                </Text>
                            </View>

                            {/* Departamento */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="business" size={20} color="#4285F4" />
                                    <Text style={styles.sectionTitle}>Departamento</Text>
                                </View>
                                <Text style={styles.infoText}>{person.departamento}</Text>
                            </View>

                            {/* Ubicación física */}
                            {(person.planta || person.cubiculo) && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="location" size={20} color="#4285F4" />
                                        <Text style={styles.sectionTitle}>Ubicación Física</Text>
                                    </View>
                                    {person.planta && (
                                        <Text style={styles.infoText}>📍 {person.planta}</Text>
                                    )}
                                    {person.cubiculo && (
                                        <Text style={styles.infoText}>🚪 Cubículo {person.cubiculo}</Text>
                                    )}
                                </View>
                            )}

                            {/* Edificio/ubicacion */}
                            {person.ubicacion?.nombre && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="school" size={20} color="#4285F4" />
                                        <Text style={styles.sectionTitle}>Edificio</Text>
                                    </View>
                                    <Text style={styles.infoText}>{person.ubicacion.nombre}</Text>
                                </View>
                            )}

                            {/* Contacto */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="mail" size={20} color="#4285F4" />
                                    <Text style={styles.sectionTitle}>Contacto</Text>
                                </View>
                                <TouchableOpacity onPress={handleEmailPress} style={styles.contactItem}>
                                    <Ionicons name="mail-outline" size={18} color="#5F6368" />
                                    <Text style={styles.contactText}>{person.email}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleCallPress} style={styles.contactItem}>
                                    <Ionicons name="call-outline" size={18} color="#5F6368" />
                                    <Text style={styles.contactText}>{person.telefono}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Botones de acción */}
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleCallPress}
                                >
                                    <Ionicons name="call" size={24} color="#fff" />
                                    <Text style={styles.actionButtonText}>Llamar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleEmailPress}
                                >
                                    <Ionicons name="mail" size={24} color="#fff" />
                                    <Text style={styles.actionButtonText}>Email</Text>
                                </TouchableOpacity>

                                {person.ubicacion && (
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={handleDirectionsPress}
                                    >
                                        <Ionicons name="navigate" size={24} color="#fff" />
                                        <Text style={styles.actionButtonText}>Ir</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Coordenadas */}
                            {person.ubicacion?.coordenadas && (
                                <View style={styles.coordinatesSection}>
                                    <Text style={styles.coordinatesLabel}>
                                        Coordenadas del departamento:
                                    </Text>
                                    <Text style={styles.coordinatesText}>
                                        Lat: {person.ubicacion.coordenadas.latitude.toFixed(6)},{" "}
                                        Lng: {person.ubicacion.coordenadas.longitude.toFixed(6)}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default PersonInformation;