import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/ProfileScreenStyle";

// ✅ Agregado setIsLoggedIn a los props
const ProfileScreen = ({ navigation, setIsLoggedIn }: { 
  navigation: any;
  setIsLoggedIn: (value: boolean) => void;
}) => {

  // ✅ Función de cerrar sesión real
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigation.navigate('Index');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLogo}>
          <MaterialCommunityIcons name="map-marker-check" size={20} color="#fff" />
          <Text style={styles.headerLogoText}>UTEQ</Text>
          <Text style={styles.headerLogoSubText}>Connect</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarWrapper}>
          <Image
            style={styles.avatar}
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9V9bFqFOyNixRcgyVHHTi9CI4nfB49BlcgA&s",
            }}
          />
          <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="pencil" size={16} color="#111" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>Cecilia Mendoza</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Alumno</Text>
        </View>

        <Text style={styles.email}>2023171020@uteq.edu.mx</Text>

        <View style={styles.infoList}>
          <Text style={styles.infoItem}>Matricula: 2023171020</Text>
          <Text style={styles.infoItem}>Carrera: Ingeniería en Desarrollo Y Gestion de Software</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesion</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default ProfileScreen;