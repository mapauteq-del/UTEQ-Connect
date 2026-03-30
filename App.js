import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Index from './src/screens/Index';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainTabs from './src/navigation/MainTabs';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          cardStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen name="Index" component={Index} />

        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>

        <Stack.Screen name="Register" component={RegisterScreen} />

        <Stack.Screen name="MainTabs">
          {(props) => <MainTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}