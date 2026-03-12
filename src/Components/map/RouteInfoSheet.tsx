import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { RouteInfo } from "../../types";
import { Ionicons } from '@expo/vector-icons';
import { styles } from "../../styles/RouteInfoSheetStyle";
import LocationInformation from "./LocationInformation";
import PersonInformation from "./PersonInformation";

interface RouteInfoSheetProps {
    routeInfo: RouteInfo | null;
    destinationName?: string;
    selectedLocation?: any;
    onClose: () => void;
    onStartNavigation?: () => void;
    isNavigating?: boolean;
    isRecalculating?: boolean;
}

const RouteInfoSheet: React.FC<RouteInfoSheetProps> = ({
    routeInfo,
    destinationName,
    selectedLocation,
    onClose,
    onStartNavigation,
    isNavigating = false,
    isRecalculating = false
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showInfo, setShowInfo] = useState(false);

    if (!routeInfo) return null;

    // DEBUG — quitar después de confirmar que funciona
    console.log('🧩 RouteInfoSheet selectedLocation:', JSON.stringify(selectedLocation));
    console.log('🧩 isPerson value:', selectedLocation?.isPerson);

    const isPerson = selectedLocation?.isPerson === true;

    const handleStartNavigation = () => {
        if (onStartNavigation) {
            onStartNavigation();
            setIsExpanded(false);
        }
    };

    const toggleExpanded = () => setIsExpanded(!isExpanded);

    const personData = isPerson ? {
        numeroEmpleado: selectedLocation.numeroEmpleado ?? "",
        nombreCompleto: selectedLocation.nombreCompleto ?? "",
        email: selectedLocation.email ?? "",
        telefono: selectedLocation.telefono ?? "",
        cargo: selectedLocation.cargo ?? "",
        departamento: selectedLocation.departamento ?? "",
        cubiculo: selectedLocation.cubiculo,
        planta: selectedLocation.planta,
        ubicacion: {
            nombre: selectedLocation.nombre,
            coordenadas: selectedLocation.posicion,
        },
    } : null;

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.handleContainer}
                    onPress={toggleExpanded}
                    activeOpacity={0.7}
                >
                    <View style={styles.handle} />
                </TouchableOpacity>

                <View style={styles.content}>
                    {!isExpanded && (
                        <View style={styles.minimizedView}>
                            <View style={styles.minimizedHeader}>
                                <View style={styles.minimizedIcon}>
                                    <Ionicons name="navigate" size={20} color="white" />
                                </View>
                                <View style={styles.minimizedInfo}>
                                    <Text style={styles.minimizedDestination} numberOfLines={1}>
                                        {isPerson ? selectedLocation.nombreCompleto : (destinationName || "Destino")}
                                    </Text>
                                    <View style={styles.minimizedStats}>
                                        <Text style={styles.minimizedStat}>{routeInfo.distancia}</Text>
                                        <Text style={styles.minimizedDivider}>•</Text>
                                        <Text style={styles.minimizedStat}>{routeInfo.duracion}</Text>
                                        {isNavigating && (
                                            <>
                                                <Text style={styles.minimizedDivider}>•</Text>
                                                <View style={styles.minimizedPulse} />
                                                <Text style={[styles.minimizedStat, { color: '#34A853' }]}>
                                                    Navegando
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity onPress={toggleExpanded}>
                                    <Ionicons name="chevron-up" size={24} color="#5F6368" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {isExpanded && (
                        <>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerLeft}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name={isPerson ? "person" : "location"}
                                            size={24}
                                            color="#4285F4"
                                        />
                                    </View>
                                    <View style={styles.headerText}>
                                        <Text style={styles.title}>Ruta hacia</Text>
                                        <Text style={styles.destination} numberOfLines={1}>
                                            {isPerson
                                                ? selectedLocation.nombreCompleto
                                                : (destinationName || "Destino")}
                                        </Text>
                                        {isPerson && (
                                            <Text style={{ fontSize: 12, color: "#5F6368", marginTop: 2 }}>
                                                {selectedLocation.cargo} · {selectedLocation.nombre}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Stats */}
                            <View style={styles.infoContainer}>
                                <View style={styles.infoCard}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="navigate" size={20} color="#4285F4" />
                                    </View>
                                    <Text style={styles.infoLabel}>Distancia</Text>
                                    <Text style={styles.infoValue}>{routeInfo.distancia}</Text>
                                </View>
                                <View style={styles.infoCard}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="time" size={20} color="#34A853" />
                                    </View>
                                    <Text style={styles.infoLabel}>Tiempo estimado</Text>
                                    <Text style={styles.infoValue}>{routeInfo.duracion}</Text>
                                </View>
                            </View>

                            {isRecalculating && (
                                <View style={styles.recalculatingBanner}>
                                    <ActivityIndicator size="small" color="#4285F4" />
                                    <Text style={styles.recalculatingText}>Recalculando ruta...</Text>
                                </View>
                            )}

                            {/* Nav + Close buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.startButton,
                                        (isNavigating || isRecalculating) && styles.startButtonDisabled
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={handleStartNavigation}
                                    disabled={isNavigating || isRecalculating}
                                >
                                    {isRecalculating ? (
                                        <>
                                            <ActivityIndicator size="small" color="white" />
                                            <Text style={styles.startButtonText}>Recalculando...</Text>
                                        </>
                                    ) : isNavigating ? (
                                        <>
                                            <View style={styles.pulseIndicator} />
                                            <Ionicons name="navigate" size={20} color="white" />
                                            <Text style={styles.startButtonText}>Navegando...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="play" size={20} color="white" />
                                            <Text style={styles.startButtonText}>Iniciar navegación</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={onClose}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="close-circle-outline" size={20} color="#666" />
                                    <Text style={styles.closeButtonText}>
                                        {isNavigating ? 'Detener navegación' : 'Cerrar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Info button */}
                            <TouchableOpacity
                                style={{
                                    padding: 16,
                                    backgroundColor: isPerson ? '#E53935' : '#4285F4',
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    shadowColor: isPerson ? '#E53935' : '#4285F4',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 6,
                                    marginTop: 12,
                                    gap: 8,
                                }}
                                activeOpacity={0.8}
                                onPress={() => {
                                    console.log('🔴 Info button pressed, isPerson:', isPerson);
                                    setShowInfo(true);
                                }}
                            >
                                <Ionicons
                                    name={isPerson ? "person-circle" : "information-circle"}
                                    size={20}
                                    color="white"
                                />
                                <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 }}>
                                    {isPerson ? "Ver información del profesor" : "Información de la ubicación"}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* Person modal — uses PersonInformation directly (has its own Modal) */}
            <PersonInformation
                person={isPerson ? personData : null}
                visible={showInfo && isPerson}
                onClose={() => setShowInfo(false)}
            />

            {/* Location modal */}
            <Modal
                visible={showInfo && !isPerson}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowInfo(false)}
            >
                <LocationInformation
                    location={selectedLocation}
                    onClose={() => setShowInfo(false)}
                />
            </Modal>
        </>
    );
};

export default RouteInfoSheet;