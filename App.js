import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import Index from "./src/screens/Index";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import MainTabs from "./src/navigation/MainTabs";

const Stack = createStackNavigator();

<<<<<<< HEAD

=======
const API_URL = "http://192.168.100.26:3000/api";
>>>>>>> 1370bcbe5c18ff74e525de26718d29d98d499148

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      // Validar token con backend
      const response = await axios.get(
        `${API_URL}/auth/validate`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setIsLoggedIn(true);
      } else {
        // Limpiar TODOS los datos si el token es inválido
        await AsyncStorage.multiRemove([
          'userToken',
          'userId',
          'userEmail',
          'userName',
          'userRol'
        ]);
        setIsLoggedIn(false);
      }
    } catch (error) {
      // Limpiar TODOS los datos en caso de error
      await AsyncStorage.multiRemove([
        'userToken',
        'userId',
        'userEmail',
        'userName',
        'userRol'
      ]);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    // 🔹 CRÍTICO: SafeAreaProvider debe envolver todo
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          // Esta key fuerza un re-render completo del Navigator cuando cambia isLoggedIn
          key={isLoggedIn ? 'logged-in' : 'logged-out'}
        >
          {!isLoggedIn ? (
            <>
              <Stack.Screen name="Index" component={Index} />

              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen
                    {...props}
                    setIsLoggedIn={setIsLoggedIn}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Register"
                component={RegisterScreen}
              />
            </>
          ) : (
            <Stack.Screen name="Main">
              {(props) => (
                <MainTabs
                  {...props}
                  setIsLoggedIn={setIsLoggedIn}
                />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}