import React, { useRef, useState } from "react";
import { View, Alert, StyleSheet, Text } from "react-native";
import { WebView } from "react-native-webview";
import { Button } from "react-native-paper";
import axios from "axios";

const API_BASE_URL = "http://192.168.1.11:8000"; // Ensure this is correct

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Find Route</Text>
      </View>
      <WebView
        ref={webViewRef}
        source={require("../../assets/findRoute.html")}
        onLoadEnd={() => setIsWebViewLoaded(true)}
        onMessage={handleMessage}
        style={styles.map}
      />
      <View style={{flexDirection:'row', justifyContent:'space-around'}}>
      <Button mode='contained' onPress={findRoute} style={styles.button}>
          <Text style={{...styles.headerText, ...{fontsize:10, fontWeight:'light'}}}>Find Route</Text>
      </Button>
      <Button mode='contained' onPress={resetSelection} style={{...styles.button, ...{backgroundColor:'rgb(248, 91, 91)'}}}>
          <Text style={{...styles.headerText, ...{fontsize:10, fontWeight:'light'}}}>Reset Points</Text>
      </Button>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "rgb(222, 233, 240)", padding:10},
  map:{flex:1, marginBottom:10},
  header: { backgroundColor: "rgb(73, 143, 235)", width: 'auto', height: 50, flexDirection: 'row', borderRadius: 20, marginBottom: 10 },
  headerText: { fontSize:20, fontWeight: 'bold', textAlign: 'center', padding: 10, color: "rgb(255,255,255)" },
  button:{borderRadius:15, width:'auto', backgroundColor:"rgb(52, 240, 52)"}
})
export default FindRouteScreen;
