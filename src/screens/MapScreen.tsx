import React from "react";
import { View } from "react-native";
import MapViewContainer from "../Components/map/MapViewContainer";
import styles from "../styles/MapScreenStyle";

const MapScreen = ({ route }: { route: any }) => {
  return (
    <View style={styles.container}>
      <MapViewContainer initialDestination={route?.params?.destination} />
    </View>
  );
};

export default MapScreen;