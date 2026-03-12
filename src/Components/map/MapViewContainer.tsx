import React, { useRef, useState, useEffect } from "react";
import { View, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import * as Location from 'expo-location';
import axios from "axios";
import styles from "../../styles/MapViewStyle";
import SearchBar from "./SearchBar";
import { Location as LocationType, RouteInfo, Coordinates, PersonData } from "../../types";
import { GOOGLE_MAPS_API_KEY } from "../../config/maps";
import { decodePolyline } from "../../utils/polyline";
import { calcularDistancia, estaFueraDeRuta } from "../../utils/geoUtils";
import RouteInfoSheet from "./RouteInfoSheet";

const UTEQ_COORDS: Coordinates = {
    latitude: 20.65398463798,
    longitude: -100.40607234656
};

const INITIAL_REGION: Region = {
    latitude: UTEQ_COORDS.latitude,
    longitude: UTEQ_COORDS.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
};

const MapViewContainer = () => {
    const [searchText, setSearchText] = useState("");
    const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
    const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);
    const [recalculando, setRecalculando] = useState(false);

    const mapRef = useRef<MapView>(null);
    const regionRef = useRef<Region>(INITIAL_REGION);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const lastRecalculationTime = useRef<number>(0);

    useEffect(() => {
        obtenerUbicacionActual();
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    const obtenerUbicacionActual = async () => {
        try {
            setLoadingLocation(true);
            const USE_TESTING_LOCATION = true;

            if (USE_TESTING_LOCATION) {
                setCurrentLocation(UTEQ_COORDS);
                mapRef.current?.animateToRegion({
                    latitude: UTEQ_COORDS.latitude,
                    longitude: UTEQ_COORDS.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
                setLoadingLocation(false);
                return;
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para calcular rutas.');
                setLoadingLocation(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const coords: Coordinates = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            setCurrentLocation(coords);
            mapRef.current?.animateToRegion({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);

        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
            Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
        } finally {
            setLoadingLocation(false);
        }
    };

    const iniciarTrackingGPS = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }

            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 3000,
                    distanceInterval: 10,
                },
                (location) => {
                    const nuevaUbicacion: Coordinates = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };

                    setCurrentLocation(nuevaUbicacion);

                    if (mapRef.current && isNavigating) {
                        mapRef.current.animateToRegion({
                            latitude: nuevaUbicacion.latitude,
                            longitude: nuevaUbicacion.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }, 500);
                    }

                    if (isNavigating && routeCoordinates.length > 0 && selectedLocation) {
                        verificarDesvio(nuevaUbicacion);
                    }
                }
            );
        } catch (error) {
            console.error('Error iniciando tracking:', error);
        }
    };

    const detenerTrackingGPS = () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    };

    const verificarDesvio = (ubicacionActual: Coordinates) => {
        const UMBRAL_DESVIO = 50;
        const TIEMPO_MIN_RECALCULO = 10000;
        const ahoraMs = Date.now();

        if (recalculando || (ahoraMs - lastRecalculationTime.current) < TIEMPO_MIN_RECALCULO) return;

        const fueraDeRuta = estaFueraDeRuta(ubicacionActual, routeCoordinates, UMBRAL_DESVIO);
        if (fueraDeRuta && selectedLocation) {
            Alert.alert('Desvío detectado', 'Recalculando ruta...', [{ text: 'OK' }], { cancelable: true });
            lastRecalculationTime.current = ahoraMs;
            calcularRuta(ubicacionActual, selectedLocation.posicion);
        }
    };

    const calcularRuta = async (origenCoords: Coordinates, destinoCoords: Coordinates) => {
        if (!origenCoords || !destinoCoords) return;

        try {
            setRecalculando(true);

            if (!origenCoords.latitude || !origenCoords.longitude ||
                !destinoCoords.latitude || !destinoCoords.longitude) {
                throw new Error('Coordenadas inválidas');
            }

            const params = new URLSearchParams({
                origin: `${origenCoords.latitude},${origenCoords.longitude}`,
                destination: `${destinoCoords.latitude},${destinoCoords.longitude}`,
                key: GOOGLE_MAPS_API_KEY,
                language: 'es',
                alternatives: 'true',
                units: 'metric',
                region: 'mx',
                mode: 'walking',
            });

            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
                { timeout: 10000 }
            );

            if (response.data.status === 'OK' && response.data.routes.length) {
                let bestRoute = response.data.routes[0];

                if (response.data.routes.length > 1) {
                    bestRoute = response.data.routes.reduce((mejor: any, actual: any) => {
                        return actual.legs[0].duration.value < mejor.legs[0].duration.value ? actual : mejor;
                    });
                }

                const leg = bestRoute.legs[0];
                if (!leg || !bestRoute.overview_polyline?.points) throw new Error('Datos de ruta incompletos');

                const points = decodePolyline(bestRoute.overview_polyline.points);
                const validPoints = points.filter(point =>
                    point.latitude && point.longitude &&
                    !isNaN(point.latitude) && !isNaN(point.longitude) &&
                    Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180
                );

                if (validPoints.length === 0) throw new Error('Puntos de ruta inválidos');

                setRouteCoordinates(validPoints);

                const rutaInfo: RouteInfo = {
                    distancia: leg.distance?.text || 'No disponible',
                    duracion: leg.duration?.text || 'No disponible',
                    distanciaValor: leg.distance?.value || 0,
                    duracionValor: leg.duration?.value || 0,
                };

                setRouteInfo(rutaInfo);

                if (mapRef.current) {
                    mapRef.current.fitToCoordinates([
                        origenCoords,
                        ...validPoints.slice(0, Math.min(validPoints.length, 100)),
                        destinoCoords
                    ], {
                        edgePadding: { top: 120, right: 80, bottom: 280, left: 80 },
                        animated: true,
                    });
                }

                console.log('✅ Ruta calculada:', rutaInfo.distancia, rutaInfo.duracion);

            } else {
                Alert.alert("Ruta no encontrada", "No se pudo encontrar una ruta.");
                setRouteCoordinates([]);
                setRouteInfo(null);
            }

        } catch (error: any) {
            console.error("Error al calcular ruta:", error);
            Alert.alert("Error", "No se pudo calcular la ruta: " + error.message);
            setRouteCoordinates([]);
            setRouteInfo(null);
        } finally {
            setRecalculando(false);
        }
    };

    const handleLocationSelect = (location: LocationType, personData?: PersonData) => {
        console.log('📍 Location selected:', location.nombre);

        let locationToSave: LocationType = { ...location };

        if (personData) {
            console.log('✅ Person data received:', personData.nombreCompleto);
            locationToSave = {
                ...location,
                isPerson: true,
                numeroEmpleado: personData.numeroEmpleado,
                nombreCompleto: personData.nombreCompleto,
                email: personData.email,
                telefono: personData.telefono,
                cargo: personData.cargo,
                departamento: personData.departamento,
                cubiculo: personData.cubiculo,
                planta: personData.planta,
            };
        }

        console.log('💾 Saving to state, isPerson:', locationToSave.isPerson);
        setSelectedLocation(locationToSave);

        mapRef.current?.animateToRegion({
            latitude: location.posicion.latitude,
            longitude: location.posicion.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 500);

        if (currentLocation) {
            calcularRuta(currentLocation, location.posicion);
        } else {
            Alert.alert('Esperando ubicación', 'Obteniendo tu ubicación actual...');
        }
    };

    const handleStartNavigation = () => {
        setIsNavigating(true);
        iniciarTrackingGPS();
        Alert.alert('Navegación iniciada', 'Se recalculará automáticamente si te desvías.');
    };

    const handleCloseRoute = () => {
        setRouteCoordinates([]);
        setRouteInfo(null);
        setSelectedLocation(null);
        setSearchText("");
        setIsNavigating(false);
        detenerTrackingGPS();

        if (currentLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        }
    };

    // DEBUG — quitar después
    console.log('🗺️ render — selectedLocation isPerson:', selectedLocation?.isPerson);

    if (loadingLocation) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4285F4" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={INITIAL_REGION}
                showsUserLocation={true}
                mapType="hybrid"
                showsMyLocationButton={true}
                followsUserLocation={isNavigating}
                onRegionChangeComplete={(r) => { regionRef.current = r; }}
            >
                {currentLocation && (
                    <Marker
                        coordinate={currentLocation}
                        title="Tu ubicación"
                        description={isNavigating ? "Navegando..." : "Ubicación actual"}
                        pinColor="blue"
                    />
                )}

                {selectedLocation && (
                    <Marker
                        coordinate={{
                            latitude: selectedLocation.posicion.latitude,
                            longitude: selectedLocation.posicion.longitude,
                        }}
                        title={selectedLocation.nombre}
                        pinColor="red"
                    />
                )}

                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#4285F4"
                        strokeWidth={4}
                    />
                )}
            </MapView>

            <SearchBar
                value={searchText}
                onChange={setSearchText}
                onSelectLocation={handleLocationSelect}
            />

            <RouteInfoSheet
                routeInfo={routeInfo}
                destinationName={selectedLocation?.nombre}
                selectedLocation={selectedLocation}
                onClose={handleCloseRoute}
                onStartNavigation={handleStartNavigation}
                isNavigating={isNavigating}
                isRecalculating={recalculando}
            />
        </View>
    );
};

export default MapViewContainer;