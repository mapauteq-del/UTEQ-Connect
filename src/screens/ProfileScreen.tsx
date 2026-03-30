import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/ProfileScreenStyle";
import EventTicketSection from "../Components/profile/EventTicketSection";
import { API_URL } from "../api/config";
const ProfileScreen = ({ navigation, setIsLoggedIn }: {
  navigation: any;
  setIsLoggedIn: (value: boolean) => void;
}) => {
  const [userData, setUserData] = React.useState<{
    token: string | null;
    userName: string | null;
    userEmail: string | null;
  } | null>(null);

  useEffect(() => {
    getDataFromStorage();
  }, []);

const getDataFromStorage = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const userName = await AsyncStorage.getItem('userName');
    const userEmail = await AsyncStorage.getItem('userEmail');
    setUserData({ token, userName, userEmail });

    if (token) {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                await AsyncStorage.setItem('userName', data.data.nombre);
                await AsyncStorage.setItem('userEmail', data.data.email);
                console.log(data.data);
                setUserData({ token, userName: data.data.nombre, userEmail: data.data.email });
            }
        } catch (_) {}
    }
};

const handleLogout = async () => {
    await AsyncStorage.multiRemove([
        'userToken', 'userId', 'userEmail', 'userName', 'userRol'
    ]);
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          {/* Avatar flotando sobre la tarjeta */}
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

          <Text style={styles.name}>{userData?.userName}</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Alumno</Text>
          </View>

          <Text style={styles.email}>{userData?.userEmail}</Text>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Boletos debajo de la tarjeta de perfil */}
        <View style={styles.ticketsSection}>
          <EventTicketSection />
        </View>
      </ScrollView>

    </View>
  );
};

export default ProfileScreen;