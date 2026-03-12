import React, { useState } from 'react';
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
import styles from '../styles/RegisterScreenStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/config'; 

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'alumno' | 'visitante' | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    // Validar que todos los campos estén llenos
    if (!fullName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre completo');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return false;
    }

    if (!userType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de usuario');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'Por favor ingresa una contraseña');
      return false;
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const requestBody = {
      nombre: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
    };

    // 🔍 DEBUG: Ver qué se está enviando
    console.log('📤 FRONTEND - Datos a enviar:', {
      nombre: requestBody.nombre,
      email: requestBody.email,
      password: '****' // No mostrar la contraseña real
    });

    const url = `${API_URL}/auth/register`;
    console.log('🌐 FRONTEND - URL completa:', url);

    try {
      console.log('📡 FRONTEND - Iniciando petición...');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 FRONTEND - Status recibido:', response.status);
      console.log('📡 FRONTEND - Status text:', response.statusText);

      // Intentar parsear la respuesta
      let data;
      const contentType = response.headers.get('content-type');
      console.log('📡 FRONTEND - Content-Type:', contentType);

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📦 FRONTEND - Data JSON recibida:', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        console.log('📦 FRONTEND - Respuesta como texto:', text);
        
        Alert.alert(
          'Error del Servidor',
          `El servidor respondió con un formato inesperado.\n\nStatus: ${response.status}\n\nRespuesta: ${text.substring(0, 200)}`
        );
        setLoading(false);
        return;
      }

      if (response.ok && data.success) {
        console.log('✅ FRONTEND - Registro exitoso');
        
        // Guardar el token y datos del usuario
        const user = data.data.user;
        const token = data.data.token;

        console.log('💾 FRONTEND - Guardando datos del usuario...');

        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userToken', user._id);
        await AsyncStorage.setItem('userEmail', user.email);
        await AsyncStorage.setItem('userName', user.nombre);
        await AsyncStorage.setItem('userRol', user.rol);

        console.log('✅ FRONTEND - Datos guardados correctamente');

        Alert.alert(
          'Registro Exitoso',
          'Tu cuenta ha sido creada correctamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        // Error del servidor
        console.log('❌ FRONTEND - Error del servidor:', data);
        
        const errorMessage = data.error || data.message || 'Error al crear la cuenta';
        
        // 🔍 Mostrar TODO el error para debugging
        Alert.alert(
          'Error al Registrar',
          `${errorMessage}\n\n[DEBUG INFO]\nStatus: ${response.status}\nSuccess: ${data.success}\nDetails: ${data.details || 'N/A'}`
        );
      }
    } catch (error: any) {
      console.error('💥 FRONTEND - Error en fetch:', error);
      console.error('💥 FRONTEND - Error completo:', JSON.stringify(error, null, 2));
      
      // 🔍 Mostrar el error completo
      Alert.alert(
        'Error de Conexión',
        `No se pudo conectar con el servidor.\n\n[DEBUG INFO]\nURL: ${url}\nError: ${error.message}\n\nVerifica:\n1. El servidor está corriendo\n2. La URL es correcta\n3. Tu conexión a internet`
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
        {/* Header con botón back */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="#0066CC" />
            <Text style={styles.backText}>Regresar</Text>
          </TouchableOpacity>
        </View>

        {/* Logo pequeño */}
        <View style={styles.miniLogoContainer}>
          <View style={styles.miniLogo}>
            <MaterialCommunityIcons name="map-marker-check" size={32} color="#fff" />
          </View>
          <Text style={styles.logoText}>UTEQ Connect</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Nombre y Apellidos */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOMBRE Y APELLIDOS</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre Completo"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />
          </View>

          {/* Email */}
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

          {/* Tipo de Usuario */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Usuario</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setUserType('alumno')}
                disabled={loading}
              >
                <View style={[styles.radioCircle, userType === 'alumno' && styles.radioSelected]}>
                  {userType === 'alumno' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Alumno</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setUserType('visitante')}
                disabled={loading}
              >
                <View style={[styles.radioCircle, userType === 'visitante' && styles.radioSelected]}>
                  {userType === 'visitante' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Visitante</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contraseña */}
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

          {/* Confirmar Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 15,
                  top: 15,
                }}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón Registrar */}
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Registrar</Text>
            )}
          </TouchableOpacity>

          {/* Botón Ya tienes cuenta */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;