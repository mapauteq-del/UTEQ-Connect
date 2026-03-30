import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, Alert, ActivityIndicator, Text, StyleSheet, Platform, StatusBar } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";

import * as Location from 'expo-location';
import axios from "axios";
import styles from "../../styles/MapViewStyle";
import SearchBar from "./SearchBar";
import { Location as LocationType, RouteInfo, Coordinates, PersonData } from "../../types";
import { GOOGLE_MAPS_API_KEY } from "../../config/maps";
import { decodePolyline } from "../../utils/polyline";
import {
    estaFueraDeRuta,
    recortarRuta,
    distanciaRestante,
    calcularBearing,
} from "../../utils/geoUtils";
import RouteInfoSheet from "./RouteInfoSheet";
import { useGraph } from "../../hooks/useGraph";
import {
    dijkstra,
    nearestNode,
    pathToCoordinates,
    routeDistance,
    walkingTime,
    haversine,
    buildTurnInstructions,
    TurnInstruction,
} from "../../utils/dijkstra";

// ─── Constantes ───────────────────────────────────────────────────────────────

const UTEQ_COORDS: Coordinates = { latitude: 20.65398463798, longitude: -100.40607234656 };
const INITIAL_REGION: Region = { ...UTEQ_COORDS, latitudeDelta: 0.01, longitudeDelta: 0.01 };

const CAMPUS_BOUNDS = {
    minLat: 20.6525, maxLat: 20.6595,
    minLng: -100.4080, maxLng: -100.4025,
};

const UMBRAL_DESVIO = 30;   // metros para detectar desvío
const MIN_RECALCULO_MS = 8000; // ms mínimo entre recálculos
const TRACKING_INTERVAL = 2000; // ms entre actualizaciones GPS
const TRACKING_DISTANCE = 3;    // metros mínimos para actualizar

// ─── Helpers ──────────────────────────────────────────────────────────────────

const estaEnCampus = (c: Coordinates) =>
    c.latitude >= CAMPUS_BOUNDS.minLat && c.latitude <= CAMPUS_BOUNDS.maxLat &&
    c.longitude >= CAMPUS_BOUNDS.minLng && c.longitude <= CAMPUS_BOUNDS.maxLng;

const getGooglePolyline = async (
    origen: Coordinates,
    destino: Coordinates
): Promise<Coordinates[]> => {
    try {
        const params = new URLSearchParams({
            origin: `${origen.latitude},${origen.longitude}`,
            destination: `${destino.latitude},${destino.longitude}`,
            key: GOOGLE_MAPS_API_KEY,
            language: "es", units: "metric", region: "mx", mode: "walking",
        });
        const res = await axios.get(
            `https://maps.googleapis.com/maps/api/directions/json?${params}`,
            { timeout: 10000 }
        );
        if (res.data.status === "OK" && res.data.routes.length) {
            return decodePolyline(res.data.routes[0].overview_polyline.points).filter(
                p => p.latitude && p.longitude &&
                    !isNaN(p.latitude) && !isNaN(p.longitude) &&
                    Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180
            );
        }
    } catch (_) { }
    return [];
};

// ─── Componente ───────────────────────────────────────────────────────────────

const MapViewContainer = () => {
    const [searchText, setSearchText] = useState("");
    const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
    const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);
    const [recalculando, setRecalculando] = useState(false);
    const [heading, setHeading] = useState<number>(0);
    const [nextInstruction, setNextInstruction] = useState<string>("");
    const [distanciaProxGiro, setDistanciaProxGiro] = useState<number>(0);

    const { nodes: graphNodes, map: graphMap, loaded: graphLoaded } = useGraph();

    const mapRef = useRef<MapView>(null);
    const regionRef = useRef<Region>(INITIAL_REGION);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const lastRecalculationTime = useRef<number>(0);
    const fullRouteRef = useRef<Coordinates[]>([]);       // ruta completa original
    const instructionsRef = useRef<TurnInstruction[]>([]);   // instrucciones de giro
    const selectedLocationRef = useRef<LocationType | null>(null);
    const isNavigatingRef = useRef(false);

    // Mantener refs sincronizados con state
    useEffect(() => { selectedLocationRef.current = selectedLocation; }, [selectedLocation]);
    useEffect(() => { isNavigatingRef.current = isNavigating; }, [isNavigating]);

    useEffect(() => {
        obtenerUbicacionActual();
        return () => { locationSubscription.current?.remove(); };
    }, []);

    // ── GPS ───────────────────────────────────────────────────────────────────

    const obtenerUbicacionActual = async () => {
        try {
            setLoadingLocation(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "Necesitamos acceso a tu ubicación.");
                return;
            }
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const coords: Coordinates = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setCurrentLocation(coords);
            mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
        } catch (e) {
            Alert.alert("Error", "No se pudo obtener tu ubicación actual");
        } finally {
            setLoadingLocation(false);
        }
    };

    const iniciarTrackingGPS = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        locationSubscription.current?.remove();

        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: TRACKING_INTERVAL,
                distanceInterval: TRACKING_DISTANCE,
            },
            (loc) => {
                const nueva: Coordinates = {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                };
                const hdg = loc.coords.heading ?? 0;

                setCurrentLocation(nueva);
                setHeading(hdg);

                if (!isNavigatingRef.current) return;

                // Rotar mapa según heading
                if (mapRef.current && hdg >= 0) {
                    mapRef.current.animateCamera(
                        { center: nueva, heading: hdg, pitch: 0, zoom: 18 },
                        { duration: 500 }
                    );
                }

                procesarPosicion(nueva);
            }
        );
    };

    const detenerTrackingGPS = () => {
        locationSubscription.current?.remove();
        locationSubscription.current = null;
    };

    // ── Procesar posición en tiempo real ──────────────────────────────────────

    const procesarPosicion = useCallback((pos: Coordinates) => {
        if (fullRouteRef.current.length === 0) return;

        // 1. Recortar la ruta — eliminar tramos ya recorridos
        const recortada = recortarRuta(pos, fullRouteRef.current);
        setRouteCoordinates(recortada);

        // 2. Actualizar distancia y tiempo restante
        const distRest = distanciaRestante(pos, fullRouteRef.current);
        setRouteInfo(prev => prev ? {
            ...prev,
            distancia: distRest >= 1000 ? `${(distRest / 1000).toFixed(1)} km` : `${Math.round(distRest)} m`,
            duracion: walkingTime(distRest),
            distanciaValor: Math.round(distRest),
            duracionValor: Math.ceil(distRest / 1.4),
        } : prev);

        // 3. Próxima instrucción de giro
        actualizarInstruccion(pos);

        // 4. Verificar desvío
        const ahora = Date.now();
        if (recalculando || ahora - lastRecalculationTime.current < MIN_RECALCULO_MS) return;

        if (estaFueraDeRuta(pos, fullRouteRef.current, UMBRAL_DESVIO)) {
            const dest = selectedLocationRef.current;
            if (!dest) return;
            lastRecalculationTime.current = ahora;
            Alert.alert("Desvío detectado", "Recalculando ruta...", [{ text: "OK" }], { cancelable: true });
            calcularRuta(pos, dest.posicion);
        }
    }, [recalculando]);

    // ── Próxima instrucción ───────────────────────────────────────────────────

    const actualizarInstruccion = (pos: Coordinates) => {
        const instructions = instructionsRef.current;
        if (instructions.length === 0) return;

        while (
            instructionsRef.current.length > 0 &&
            haversine(
                pos.latitude, pos.longitude,
                instructionsRef.current[0].coords.latitude,
                instructionsRef.current[0].coords.longitude
            ) <= 10
        ) {
            instructionsRef.current = instructionsRef.current.slice(1);
        }

        // Mostrar la siguiente
        if (instructionsRef.current.length > 0) {
            const siguiente = instructionsRef.current[0];
            const d = haversine(pos.latitude, pos.longitude,
                siguiente.coords.latitude, siguiente.coords.longitude);
            setNextInstruction(siguiente.instruction);
            setDistanciaProxGiro(Math.round(d));
        } else {
            setNextInstruction("Has llegado a tu destino");
            setDistanciaProxGiro(0);
        }
    };

    // ── Ruta híbrida ──────────────────────────────────────────────────────────

    const calcularRutaHibrida = async (
        origen: Coordinates,
        destino: Coordinates
    ): Promise<boolean> => {
        if (!graphLoaded || graphNodes.length === 0) return false;
        if (!estaEnCampus(destino)) return false;

        const allNodeIds = graphNodes.map(n => n.nodeId);
        const endNode = nearestNode(graphNodes, destino.latitude, destino.longitude);

        if (haversine(destino.latitude, destino.longitude, endNode.lat, endNode.lng) > 80) return false;

        let fullCoords: Coordinates[];
        let distTotal: number;

        if (estaEnCampus(origen)) {
            // Solo Dijkstra
            const startNode = nearestNode(graphNodes, origen.latitude, origen.longitude);
            const path = dijkstra(graphMap, allNodeIds, startNode.nodeId, endNode.nodeId);
            if (path.length === 0) return false;

            fullCoords = pathToCoordinates(path, graphNodes, graphMap);
            distTotal = routeDistance(path, graphMap);
        } else {
            // Google exterior + Dijkstra interior
            const entryNode = nearestNode(graphNodes, origen.latitude, origen.longitude);
            const [exteriorPts, path] = await Promise.all([
                getGooglePolyline(origen, { latitude: entryNode.lat, longitude: entryNode.lng }),
                Promise.resolve(dijkstra(graphMap, allNodeIds, entryNode.nodeId, endNode.nodeId)),
            ]);

            if (path.length === 0) return false;

            const innerCoords = pathToCoordinates(path, graphNodes, graphMap);
            const exterior = exteriorPts.length > 0
                ? exteriorPts
                : [{ latitude: origen.latitude, longitude: origen.longitude }];

            fullCoords = [...exterior, ...innerCoords.slice(1)];

            // Distancia exterior
            let distExt = 0;
            for (let i = 0; i < exterior.length - 1; i++) {
                distExt += haversine(exterior[i].latitude, exterior[i].longitude,
                    exterior[i + 1].latitude, exterior[i + 1].longitude);
            }
            distTotal = distExt + routeDistance(path, graphMap);
        }

        // Guardar ruta completa en ref para el tiempo real
        fullRouteRef.current = fullCoords;
        instructionsRef.current = buildTurnInstructions(fullCoords);

        setRouteCoordinates(fullCoords);
        setRouteInfo({
            distancia: distTotal >= 1000 ? `${(distTotal / 1000).toFixed(1)} km` : `${Math.round(distTotal)} m`,
            duracion: walkingTime(distTotal),
            distanciaValor: Math.round(distTotal),
            duracionValor: Math.ceil(distTotal / 1.4),
        });

        // Primera instrucción
        if (instructionsRef.current.length > 0) {
            setNextInstruction(instructionsRef.current[0].instruction);
        }

        mapRef.current?.fitToCoordinates(
            [origen, ...fullCoords.slice(0, 60), destino],
            { edgePadding: { top: 120, right: 80, bottom: 280, left: 80 }, animated: true }
        );

        return true;
    };

    const calcularRutaGoogle = async (origen: Coordinates, destino: Coordinates) => {
        try {
            const params = new URLSearchParams({
                origin: `${origen.latitude},${origen.longitude}`,
                destination: `${destino.latitude},${destino.longitude}`,
                key: GOOGLE_MAPS_API_KEY,
                language: "es", alternatives: "true",
                units: "metric", region: "mx", mode: "walking",
            });
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/directions/json?${params}`,
                { timeout: 10000 }
            );
            if (response.data.status === "OK" && response.data.routes.length) {
                const bestRoute = response.data.routes.reduce((best: any, r: any) =>
                    r.legs[0].duration.value < best.legs[0].duration.value ? r : best
                );
                const leg = bestRoute.legs[0];
                if (!leg || !bestRoute.overview_polyline?.points) throw new Error("Ruta incompleta");
                const points = decodePolyline(bestRoute.overview_polyline.points).filter(
                    p => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude) &&
                        Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180
                );
                if (!points.length) throw new Error("Puntos inválidos");

                fullRouteRef.current = points;
                instructionsRef.current = buildTurnInstructions(points);

                setRouteCoordinates(points);
                setRouteInfo({
                    distancia: leg.distance?.text || "No disponible",
                    duracion: leg.duration?.text || "No disponible",
                    distanciaValor: leg.distance?.value || 0,
                    duracionValor: leg.duration?.value || 0,
                });
                if (instructionsRef.current.length > 0) {
                    setNextInstruction(instructionsRef.current[0].instruction);
                }
                mapRef.current?.fitToCoordinates(
                    [origen, ...points.slice(0, 100), destino],
                    { edgePadding: { top: 120, right: 80, bottom: 280, left: 80 }, animated: true }
                );
            } else {
                Alert.alert("Ruta no encontrada", "No se pudo encontrar una ruta.");
                setRouteCoordinates([]); setRouteInfo(null);
            }
        } catch (e: any) {
            Alert.alert("Error", "No se pudo calcular la ruta: " + e.message);
            setRouteCoordinates([]); setRouteInfo(null);
        }
    };

    const calcularRuta = async (origen: Coordinates, destino: Coordinates) => {
        setRecalculando(true);
        try {
            const usoHibrida = await calcularRutaHibrida(origen, destino);
            if (!usoHibrida) await calcularRutaGoogle(origen, destino);
        } finally {
            setRecalculando(false);
        }
    };

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleLocationSelect = (location: LocationType, personData?: PersonData) => {
        const locationToSave: LocationType = personData
            ? { ...location, isPerson: true, ...personData }
            : { ...location };

        setSelectedLocation(locationToSave);
        mapRef.current?.animateToRegion(
            { ...location.posicion, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500
        );
        if (currentLocation) {
            calcularRuta(currentLocation, location.posicion);
        } else {
            Alert.alert("Esperando ubicación", "Obteniendo tu ubicación actual...");
        }
    };

    const handleStartNavigation = () => {
        setIsNavigating(true);
        iniciarTrackingGPS();
        if (instructionsRef.current.length > 0) {
            setNextInstruction(instructionsRef.current[0].instruction);
        }
        Alert.alert("Navegación iniciada", "La ruta se recalculará automáticamente si te desvías.");
    };

    const handleCloseRoute = () => {
        setRouteCoordinates([]);
        setRouteInfo(null);
        setSelectedLocation(null);
        setSearchText("");
        setIsNavigating(false);
        setNextInstruction("");
        setDistanciaProxGiro(0);
        fullRouteRef.current = [];
        instructionsRef.current = [];
        detenerTrackingGPS();
        if (currentLocation && mapRef.current) {
            mapRef.current.animateToRegion(
                { ...currentLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500
            );
        }
    };


    if (loadingLocation) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#4285F4" />
            </View>
        );
    }

    const getDirectionIcon = (instruction: string): string => {
        const lower = instruction.toLowerCase();
        if (lower.includes("derecha") && lower.includes("completamente")) return "↱";
        if (lower.includes("izquierda") && lower.includes("completamente")) return "↰";
        if (lower.includes("derecha")) return "→";
        if (lower.includes("izquierda")) return "←";
        if (lower.includes("llegado") || lower.includes("destino")) return "⚑";
        if (lower.includes("inicia")) return "▶";
        return "↑";
    };

    const markerPinColor = selectedLocation?.isEvent ? "orange" : "red";
    const markerTitle = selectedLocation?.isEvent ? selectedLocation.eventTitulo : selectedLocation?.nombre;
    const markerDesc = selectedLocation?.isEvent
        ? `${selectedLocation.eventHoraInicio}–${selectedLocation.eventHoraFin}`
        : selectedLocation?.isPerson ? selectedLocation.cargo : undefined;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={INITIAL_REGION}
                showsUserLocation
                showsCompass
                mapType="hybrid"
                showsMyLocationButton={!isNavigating}
                followsUserLocation={false}
                onRegionChangeComplete={(r) => { regionRef.current = r; }}
            >
                {currentLocation && !isNavigating && (
                    <Marker
                        coordinate={currentLocation}
                        title="Tu ubicación"
                        pinColor="blue"
                    />
                )}

                {selectedLocation && (
                    <Marker
                        coordinate={selectedLocation.posicion}
                        title={markerTitle}
                        description={markerDesc}
                        pinColor={markerPinColor}
                    />
                )}

                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#4285F4"
                        strokeWidth={5}
                        lineDashPattern={undefined}
                    />
                )}
            </MapView>

            {isNavigating && nextInstruction !== "" && (
                <View style={[
                    navStyles.container,
                ]}>
                    <View style={navStyles.iconContainer}>
                        <Text style={navStyles.icon}>{getDirectionIcon(nextInstruction)}</Text>
                    </View>
                    <View style={navStyles.textContainer}>
                        <Text style={navStyles.instructionText} numberOfLines={2}>
                            {nextInstruction}
                        </Text>
                        {distanciaProxGiro > 0 && (
                            <Text style={navStyles.distanceText}>
                                en {distanciaProxGiro < 1000
                                    ? `${distanciaProxGiro} m`
                                    : `${(distanciaProxGiro / 1000).toFixed(1)} km`}
                            </Text>
                        )}
                    </View>
                    {routeInfo && (
                        <View style={navStyles.etaContainer}>
                            <Text style={navStyles.etaTime}>{routeInfo.duracion}</Text>
                            <Text style={navStyles.etaDist}>{routeInfo.distancia}</Text>
                        </View>
                    )}
                </View>
            )}

            {
                !isNavigating && (
                    <SearchBar
                        value={searchText}
                        onChange={setSearchText}
                        onSelectLocation={handleLocationSelect}
                    />
                )
            }

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


const navStyles = StyleSheet.create({
    container: {
        position: "absolute",
        top: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44,
        left: 12,
        right: 12,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 18,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 12,
        zIndex: 999,
        borderRadius: 20,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: "#1a73e8",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
        flexShrink: 0,
    },
    icon: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    instructionText: {
        color: "#111",
        fontSize: 20,
        fontWeight: "700",
        lineHeight: 26,
    },
    distanceText: {
        color: "#1a73e8",
        fontSize: 15,
        fontWeight: "600",
        marginTop: 3,
    },
    etaContainer: {
        alignItems: "flex-end",
        justifyContent: "center",
        marginLeft: 10,
        flexShrink: 0,
    },
    etaTime: {
        color: "#111",
        fontSize: 16,
        fontWeight: "700",
    },
    etaDist: {
        color: "#888",
        fontSize: 13,
        marginTop: 2,
    },
});

export default MapViewContainer;