import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles/LoginScreenStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/config';
import * as LocalAuthentication from 'expo-local-authentication';

interface Props {
  navigation: any;
  setIsLoggedIn: (value: boolean) => void;
}

const LoginScreen = ({ navigation, setIsLoggedIn }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  // ✅ Ahora verifica biometricUser en lugar de userToken
  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const biometricUser = await AsyncStorage.getItem('biometricUser');
    setBiometricAvailable(compatible && enrolled && !!biometricUser);
  };

  // ✅ Ahora llama al servidor para obtener un nuevo token
  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Inicia sesión con tu huella',
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
    });

    if (result.success) {
      try {
        const biometricUser = await AsyncStorage.getItem('biometricUser');

        if (!biometricUser) {
          Alert.alert('Error', 'No hay sesión biométrica guardada');
          return;
        }

        const response = await fetch(`${API_URL}/auth/biometric-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: biometricUser }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const user = data.data.user;
          const token = data.data.token;

          // Guardar nuevo token y datos del usuario
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('userId', user._id);
          await AsyncStorage.setItem('userEmail', user.email);
          await AsyncStorage.setItem('userName', user.nombre);
          await AsyncStorage.setItem('userRol', user.rol);

          setIsLoggedIn(true);
          navigation.replace('MainTabs');
        } else {
          Alert.alert('Error', data.error || 'Error al iniciar sesión');
        }
      } catch (error) {
        Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor');
      }
    } else {
      Alert.alert('Error', 'No se pudo verificar tu identidad');
    }
  };

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const user = data.data.user;
        const token = data.data.token;

        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userId', user._id);
        await AsyncStorage.setItem('userEmail', user.email);
        await AsyncStorage.setItem('userName', user.nombre);
        await AsyncStorage.setItem('userRol', user.rol);

        
        await AsyncStorage.setItem('biometricUser', user.email);

        setIsLoggedIn(true);
        navigation.replace('MainTabs');
      } else {
        const errorMessage = data.error || 'Error al iniciar sesión';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert(
        'Error de Conexión',
        'No se pudo conectar con el servidor. Por favor verifica tu conexión a internet.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="#0066CC" />
            <Text style={styles.backText}>Regresar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.miniLogoContainer}>
          <View style={styles.miniLogo}>
            <MaterialCommunityIcons name="map-marker-check" size={32} color="#fff" />
          </View>
          <Text style={styles.logoText}>UTEQ Connect</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRONICO</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 15,
                  top: 15,
                }}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.continueButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Continuar</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity
              style={{
                alignItems: 'center',
                marginTop: 20,
                padding: 12,
              }}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <MaterialCommunityIcons name="fingerprint" size={48} color="#0066CC" />
              <Text style={{ color: '#0066CC', marginTop: 6, fontSize: 14 }}>
                Iniciar con huella
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;