import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EventsListScreen from '../screens/EventListScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import TicketScreen from '../screens/TicketScreen';
import { EventsStackParamList } from '../types/navigation';

const Stack = createStackNavigator<EventsStackParamList>();

const EventsNavigator = () => {
  return (
    <Stack.Navigator
      id="EventsStack"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f5f5f5' },
      }}
    >
      <Stack.Screen name="EventsList" component={EventsListScreen} />

      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Detalle del Evento',
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <Stack.Screen
        name="Ticket"
        component={TicketScreen}
        options={{
          headerShown: true,
          headerTitle: 'Mi Boleto',
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Stack.Navigator>
  );
};

export default EventsNavigator;
