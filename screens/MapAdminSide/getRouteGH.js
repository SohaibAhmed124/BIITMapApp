import React, { useRef, useState } from "react";
import { View, Alert, StyleSheet, Text } from "react-native";
import { WebView } from "react-native-webview";
import { Button } from "react-native-paper";
import axios from "axios";
import polyline from '@mapbox/polyline';

const GRAPH_HOPPER_HOST = "http://192.168.1.6:8989"; // Your GraphHopper API URL

const FindRouteScreen = () => {
  const webViewRef = useRef(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);
  const [routeDetails, setRouteDetails] = useState({
    distance: null,
    time: null,
  });

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "start_selected") {
        setStartPoint({ lat: data.lat, lon: data.lon });
        Alert.alert("Start Point Set", `Lat: ${data.lat}, Lon: ${data.lon}`);
      } else if (data.type === "end_selected") {
        setEndPoint({ lat: data.lat, lon: data.lon });
        Alert.alert("End Point Set", `Lat: ${data.lat}, Lon: ${data.lon}`);
      }
    } catch (error) {
      console.error("WebView message error:", error);
    }
  };

  const fetchRouteFromGraphHopper = async () => {
    if (!startPoint || !endPoint) {
      Alert.alert("Error", "Please select both Start and End points.");
      return;
    }

    const url = `${GRAPH_HOPPER_HOST}/route?point=${startPoint.lat},${startPoint.lon}&point=${endPoint.lat},${endPoint.lon}&profile=car&locale=en&points_encoded=true`;

    try {
      const response = await axios.get(url);
      const { paths } = response.data;

      if (paths && paths.length > 0) {
        const encodedPolyline = paths[0].points;
        const decodedCoords = polyline.decode(encodedPolyline);
        const route = decodedCoords.map(([lat, lng]) => ({ lat, lon: lng }));

        const distance = paths[0].distance; // distance in meters
        const time = paths[0].time; // time in milliseconds

        // Convert distance to kilometers and time to minutes
        const distanceInKm = (distance / 1000).toFixed(2); // distance in km
        const timeInMinutes = (time / 1000 / 60).toFixed(2); // time in minutes

        // Set route details (distance and time)
        setRouteDetails({
          distance: distanceInKm,
          time: timeInMinutes,
        });

        if (isWebViewLoaded && webViewRef.current) {
          webViewRef.current.injectJavaScript(
            `window.displayRoute(${JSON.stringify(route)}); true;`
          );
        }
      } else {
        Alert.alert("Error", "No route found.");
      }
    } catch (error) {
      console.error("Error fetching route from GraphHopper:", error);
      Alert.alert("Error", "Failed to fetch route.");
    }
  };

  const resetMap = () => {
    setStartPoint(null);
    setEndPoint(null);

    if (isWebViewLoaded && webViewRef.current) {
      webViewRef.current.injectJavaScript("window.resetMap(); true;");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Find Route</Text>
      </View>

      <WebView
        ref={webViewRef}
        source={require("../../assets/getRoute.html")}
        onMessage={handleMessage}
        onLoadEnd={() => setIsWebViewLoaded(true)}
        style={styles.map}
      />

      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={fetchRouteFromGraphHopper} style={styles.findBtn}>
          <Text style={styles.buttonText}>Find Route</Text>
        </Button>
        <Button mode="contained" onPress={resetMap} style={styles.resetBtn}>
          <Text style={styles.buttonText}>Reset Points</Text>
        </Button>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailsText}>
          Distance: {routeDetails.distance ? `${routeDetails.distance} km` : "N/A"}
        </Text>
        <Text style={styles.detailsText}>
          Estimated Time: {routeDetails.time ? `${routeDetails.time} minutes` : "N/A"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "rgb(222, 233, 240)", padding: 10 },
  map: { flex: 1, marginBottom: 10 },
  header: {
    backgroundColor: "rgb(73, 143, 235)",
    height: 50,
    justifyContent: "center",
    borderRadius: 20,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  findBtn: {
    backgroundColor: "rgb(52, 240, 52)",
    borderRadius: 15,
  },
  resetBtn: {
    backgroundColor: "rgb(248, 91, 91)",
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 14,
    color: "#fff",
    padding: 6,
  },
  detailsContainer: {
    padding: 10,
    backgroundColor: "#fff",
    marginTop: 10,
    borderRadius: 10,
  },
  detailsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default FindRouteScreen;
