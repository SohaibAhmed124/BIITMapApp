import React, { useRef, useState } from "react";
import { View, Button, Alert } from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";

const API_BASE_URL = "http://192.168.1.10:8000"; // Ensure this is correct

const FindRouteScreen = () => {
  const webViewRef = useRef(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);

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
      console.error("Error parsing WebView message:", error);
    }
  };

  const findRoute = async () => {
    if (!startPoint || !endPoint) {
      Alert.alert("Error", "Please select both Start and End points.");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/get_route/`, {
        params: {
          start_lat: startPoint.lat,
          start_lon: startPoint.lon,
          end_lat: endPoint.lat,
          end_lon: endPoint.lon,
        },
      });

      if (response.data.route && isWebViewLoaded) {
        webViewRef.current.injectJavaScript(`window.displayRoute(${JSON.stringify(response.data.route)})`);
      } else {
        Alert.alert("Error", "No route found.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Error", "Failed to fetch the route. Check your API connection.");
    }
  };

  const resetSelection = () => {
    setStartPoint(null);
    setEndPoint(null);
    if (isWebViewLoaded) {
      webViewRef.current.injectJavaScript("window.resetMap()");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={require("../assets/findRoute.html")}
        onLoadEnd={() => setIsWebViewLoaded(true)}
        onMessage={handleMessage}
        style={{ flex: 1 }}
      />
      <Button title="Find Route" onPress={findRoute} />
      <Button title="Reset Points" onPress={resetSelection} />
    </View>
  );
};

export default FindRouteScreen;
