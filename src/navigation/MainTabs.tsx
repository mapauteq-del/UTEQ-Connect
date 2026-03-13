import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons as Icon } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import EventsNavigator from './EventsNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

const FadeScreen = ({ children }: { children: React.ReactNode }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity }}>
      {children}
    </Animated.View>
  );
};

interface MainTabsProps {
  setIsLoggedIn: (value: boolean) => void;
}

const MainTabs = ({ setIsLoggedIn }: MainTabsProps) => {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#003366',
        tabBarInactiveTintColor: '#aaa',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 8,
        },
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      >
        {(props) => (
          <FadeScreen>
            <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />
          </FadeScreen>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="EventsTab"
        options={{
          tabBarLabel: 'Eventos',
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
          ),
        }}
      >
        {() => (
          <FadeScreen>
            <EventsNavigator />
          </FadeScreen>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="MapTab"
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? 'map' : 'map-outline'} size={22} color={color} />
          ),
        }}
      >
        {() => (
          <FadeScreen>
            <MapScreen />
          </FadeScreen>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="AccountTab"
        options={{
          tabBarLabel: 'Cuenta',
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      >
        {(props) => (
          <FadeScreen>
            <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />
          </FadeScreen>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 14,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    paddingBottom: 0,
    paddingTop: 0,
  },
  tabBarBackground: {
    flex: 1,
    borderRadius: 35,
    backgroundColor: '#fff',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
});

export default MainTabs;