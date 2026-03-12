import { NavigatorScreenParams } from '@react-navigation/native';

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string };
  Ticket: { eventId: string };
};


export type MainTabParamList = {
  HomeTab: undefined;
  MapTab: { destination?: any } | undefined;
  EventsTab: NavigatorScreenParams<EventsStackParamList>;
  AccountTab: undefined;
};

// types/navigation.ts
export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};


