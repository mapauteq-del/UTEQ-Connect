// src/screens/MapScreen.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapViewContainer from "../Components/map/MapViewContainer";
import styles from "../styles/MapScreenStyle";

const MapScreen = ({ navigation }: { navigation: any }) => {
    return (
        <View style={styles.container}>
            <MapViewContainer />
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("Index")}
                >
                    <MaterialCommunityIcons name="home-outline" size={24} color="#555" />
                    <Text style={styles.navLabel}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="calendar-blank-outline" size={24} color="#555" />
                    <Text style={styles.navLabel}>Eventos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("Map")}
                >
                    <MaterialCommunityIcons name="map-marker-outline" size={24} color="#555" />
                    <Text style={styles.navLabel}>Mapa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("Profile")}
                >
                    <MaterialCommunityIcons name="account-outline" size={24} color="#555" />
                    <Text style={styles.navLabel}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MapScreen;
