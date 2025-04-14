import React, { useRef, useState, useEffect } from "react";
import { View, Button, Alert, StyleSheet, Text } from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";

const API_BASE_URL = "http://192.168.1.11:8000"; // Adjust to your backend

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
        source={require("../../assets/createRoute.html")}
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
