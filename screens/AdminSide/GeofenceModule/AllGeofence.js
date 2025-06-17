import React, { useEffect, useState, useRef} from "react";
import { View, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import { MAP_URL } from "../../../Api/BaseConfig";
import { GeofenceMap } from "../../CustomComponents/GeofenceMap";

const AllGeofencesScreen = ({ route }) => {
  const { geofences } = route.params;
  const webViewRef = useRef(null);

  const injectGeofencesScript = (geofences) => {
    const formattedGeofences = geofences.map(geofence => ({
      ...geofence,
      boundary: geofence.boundary.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude
      }))
    }));
    console.log(JSON.stringify(formattedGeofences));
    const script = `loadGeofencesFromReactNative(${JSON.stringify(formattedGeofences)})`;
    webViewRef.current?.injectJavaScript(script);
  };

  return (
    <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{html:GeofenceMap(MAP_URL)}}
          style={styles.webView}
          onLoadEnd={() => {
            injectGeofencesScript(geofences)
          }}
          webviewDebuggingEnabled={true}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F4F7FC',
  },
  webView: {
    flex: 1,
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default AllGeofencesScreen;
