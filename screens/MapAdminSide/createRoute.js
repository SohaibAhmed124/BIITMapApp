import React, { useRef, useState, useEffect } from "react";
import { View, Button, Alert, StyleSheet, Text } from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import { BASE_IP, MAP_URL } from "../../Api/BaseConfig";

const API_BASE_URL = `http://${BASE_IP}:8000`;

const generateHTML = (MAP_URL) => `
<!DOCTYPE html>
<html>
<head>
    <title>Create Route</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-draw/dist/leaflet.draw.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet-draw/dist/leaflet.draw.css"/>
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map').setView([33.6844, 73.0479], 13);
        L.tileLayer('${MAP_URL}').addTo(map);

        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        var drawControl = new L.Control.Draw({
            edit: { featureGroup: drawnItems },
            draw: { polyline: true, polygon: false, circle: false, marker: false, rectangle: false }
        });
        map.addControl(drawControl);

        map.on('draw:created', function (e) {
            var layer = e.layer;
            drawnItems.addLayer(layer);
            var coordinates = layer.getLatLngs().map(coord => [coord.lng, coord.lat]);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "drawn_route", coordinates: coordinates }));
        });
    </script>
</body>
</html>

`;

const CreateRouteScreen = () => {
  const webViewRef = useRef(null);
  const [drawnCoords, setDrawnCoords] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleMessage = (event) => {
    if (!isMounted) return; // Prevents running code if the component is unmounted

    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "drawn_route") {
        setDrawnCoords(data.coordinates);
        if (isMounted) Alert.alert("Route Drawn", "You can now save this route.");
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  const saveRoute = async () => {
    if (drawnCoords.length < 2) {
      if (isMounted) Alert.alert("Error", "Draw a valid route before saving.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/insert_route/`, {
        coordinates: drawnCoords,
        oneway: false,
      });

      if (isMounted) Alert.alert("Success", "Route saved successfully!");
    } catch (err) {
      console.error("Error inserting route:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Create Route</Text>
      </View>
      <WebView
        ref={webViewRef}
        source={{html:generateHTML(MAP_URL)}}
        onMessage={handleMessage}
        style={{ flex: 1 }}
      />
      <Button title="Save Route" onPress={saveRoute} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "rgb(222, 233, 240)", padding:10},
  header: { backgroundColor: "rgb(73, 143, 235)", width: 'auto', height: 50, flexDirection: 'row', borderRadius: 20, marginBottom: 10 },
  headerText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 10, color: "rgb(255,255,255)" },
})
export default CreateRouteScreen;
