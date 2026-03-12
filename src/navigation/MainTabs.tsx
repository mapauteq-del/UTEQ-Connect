import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../Views/MapScreen';
import EventsNavigator from './EventsNavigator';
import { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

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
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color}
            />
          ),
        }}
      >
        {(props) => (
          <HomeScreen 
            {...props} 
            setIsLoggedIn={setIsLoggedIn} 
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="EventsTab"
        component={EventsNavigator}
        options={{
          tabBarLabel: 'Eventos',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon 
              name={focused ? 'calendar' : 'calendar-outline'} 
              size={24} 
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon 
              name={focused ? 'map' : 'map-outline'} 
              size={24} 
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="AccountTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Cuenta',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 110,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBarIcon: {
    marginTop: 4,
  },
});

export default MainTabs;