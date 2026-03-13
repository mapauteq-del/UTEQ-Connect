import React from "react";
import { View } from "react-native";
import MapViewContainer from "../Components/map/MapViewContainer";
import styles from "../styles/MapScreenStyle";

const MapScreen = () => {
  return (
    <View style={styles.container}>
      <MapViewContainer />
    </View>
  );
};

export default MapScreen;