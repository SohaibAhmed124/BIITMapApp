import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Alert,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { WebView } from "react-native-webview";
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  Surface,
} from "react-native-paper";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { ROUTE_HOST, MAP_URL, BASE_URL, LEAFLET_JS, LEAFLET_CSS} from "../../Api/BaseConfig";

let debounceTimeout;

const generateHTML = (MAP_URL, JS, CSS) => `
<!DOCTYPE html>
<html>
<head>
  <title>Find Route</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${CSS}" />
  <script src="${JS}"></script>
  <style>
    body, html { margin: 0; padding: 0; height: 100%; }
    #map { height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    let map = L.map('map').setView([33.6844, 73.0479], 13);
    L.tileLayer('${MAP_URL}').addTo(map);

    let startMarker = null;
    let endMarker = null;
    let routeLayer = null;
    let routeSegments = [];

    map.on('click', function (e) {
      if (!startMarker) {
        startMarker = L.marker(e.latlng).addTo(map).bindPopup("Start").openPopup();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "start_selected", lat: e.latlng.lat, lon: e.latlng.lng }));
      } else if (!endMarker) {
        endMarker = L.marker(e.latlng).addTo(map).bindPopup("End").openPopup();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "end_selected", lat: e.latlng.lat, lon: e.latlng.lng }));
      }
    });

    window.displayRoute = function (route, congestedPoints = []) {
      // Clear previous route
      if (routeLayer) {
        routeLayer.clearLayers();
        map.removeLayer(routeLayer);
      }
      
      // Create a feature group to hold all route segments
      routeLayer = L.featureGroup().addTo(map);
      routeSegments = [];
      
      // Function to check if point is congested
      const isCongested = (lat, lon) => {
        return congestedPoints.some(p => 
          Math.abs(p.lat - lat) < 0.001 && Math.abs(p.lon - lon) < 0.001
        );
      };
      
      // Draw route segments with congestion awareness
      for (let i = 0; i < route.length - 1; i++) {
        const start = route[i];
        const end = route[i + 1];
        
        const congested = isCongested(start.lat, start.lon) || 
                         isCongested(end.lat, end.lon);
        
        const segment = L.polyline(
          [[start.lat, start.lon], [end.lat, end.lon]], 
          {
            color: congested ? 'red' : '#0077FF',
            weight: 4,
            opacity: 0.8,
            lineJoin: 'round'
          }
        );
        
        routeSegments.push(segment);
        routeLayer.addLayer(segment);
      }
      
      // Fit map to route bounds
      map.fitBounds(routeLayer.getBounds(), {
        padding: [30, 30],
        maxZoom: 15
      });
    };

    window.resetMap = function () {
      if (startMarker) map.removeLayer(startMarker);
      if (endMarker) map.removeLayer(endMarker);
      if (routeLayer) map.removeLayer(routeLayer);
      startMarker = null;
      endMarker = null;
      routeLayer = null;
      routeSegments = [];
    };
  </script>
</body>
</html>
`;
const FindRouteScreen = () => {
  const webViewRef = useRef(null);
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);
  const [routeDetails, setRouteDetails] = useState({ distance: null, time: null });
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchSuggestions = async (query, setter) => {
    if (query.length < 3) return setter([]);
    try {
      const res = await axios.get(`${BASE_URL}/api/location/search-location?location=${query}`);
      setter(res.data);
    } catch {
      setter([]);
    }
  };

  const handleDebouncedFetch = (text, setter) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => fetchSuggestions(text, setter), 300);
  };

  const handleLocationSelect = (item, isStart) => {
    const coords = { lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
    if (webViewRef.current && isWebViewLoaded) {
      webViewRef.current.injectJavaScript(`
        ${isStart ? "start" : "end"}Marker = L.marker([${coords.lat}, ${coords.lon}]).addTo(map).bindPopup("${isStart ? "Start" : "End"}").openPopup();
        map.setView([${coords.lat}, ${coords.lon}], 15);
        true;
      `);
    }
    Keyboard.dismiss();
    if (isStart) {
      setStartQuery(item.display_name);
      setStartPoint(coords);
      setStartSuggestions([]);
    } else {
      setEndQuery(item.display_name);
      setEndPoint(coords);
      setEndSuggestions([]);
    }
  };

  const checkCongestion = async (coordinates) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/location/check-congestion`,
        { graphhopper_coordinates: coordinates }
      );
      console.log(`congested Segment - ${response.data.result.matchedPoints}`)

      if (response.data.result && response.data.result.status === "Segment is Congested") {
        return response.data.result.matchedPoints || [];
      }
      return [];
    } catch (error) {
      console.error('Congestion check error:', error);
      return [];
    }
  };

  const fetchRouteFromGraphHopper = async () => {
    if (!startPoint || !endPoint) {
      Alert.alert("Error", "Please select both Start and End points.");
      return;
    }

    setIsLoading(true);
    const url = `${ROUTE_HOST}/route?point=${startPoint.lat},${startPoint.lon}&point=${endPoint.lat},${endPoint.lon}&profile=car&locale=en&points_encoded=true`;

    try {
      const response = await axios.get(url);
      const { paths } = response.data;

      if (paths?.length) {
        const encodedPolyline = paths[0].points;
        const decodedCoords = polyline.decode(encodedPolyline);
        const route = decodedCoords.map(([lat, lng]) => ({ lat, lon: lng }));
        
        console.log(decodedCoords);

        setRouteDetails({
          distance: (paths[0].distance / 1000).toFixed(2),
          time: (paths[0].time / 1000 / 60).toFixed(2),
        });

        // Check for congestion
        const congestedPoints = await checkCongestion(decodedCoords);
        console.log(JSON.stringify(congestedPoints))

        // Display route with congestion information
        webViewRef.current.injectJavaScript(
          `window.displayRoute(${JSON.stringify(route)}, ${JSON.stringify(congestedPoints)}); true;`
        );
      } else {
        Alert.alert("Error", "No route found.");
      }
    } catch (error) {
      console.error("Route error:", error);
      Alert.alert("Error", "Failed to fetch route.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetMap = () => {
    setStartPoint(null);
    setEndPoint(null);
    setStartQuery("");
    setEndQuery("");
    setStartSuggestions([]);
    setEndSuggestions([]);
    setRouteDetails({ distance: null, time: null });
    webViewRef.current?.injectJavaScript("window.resetMap(); true;");
  };

  const renderSuggestion = (item, isStart) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleLocationSelect(item, isStart)}
    >
      <Text>{item.display_name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.searchCard}>
        <Card.Content>
          <TextInput
            label="Search Start Point"
            mode="outlined"
            value={startQuery}
            onChangeText={(text) => {
              setStartQuery(text);
              handleDebouncedFetch(text, setStartSuggestions);
            }}
            style={styles.input}
          />
          {startSuggestions.length > 0 && (
            <FlatList
              data={startSuggestions}
              keyExtractor={(item) => item.place_id.toString()}
              renderItem={({ item }) => renderSuggestion(item, true)}
              style={styles.suggestionList}
            />
          )}

          <Divider style={{ marginVertical: 6 }} />

          <TextInput
            label="Search End Point"
            mode="outlined"
            value={endQuery}
            onChangeText={(text) => {
              setEndQuery(text);
              handleDebouncedFetch(text, setEndSuggestions);
            }}
            style={styles.input}
          />
          {endSuggestions.length > 0 && (
            <FlatList
              data={endSuggestions}
              keyExtractor={(item) => item.place_id.toString()}
              renderItem={({ item }) => renderSuggestion(item, false)}
              style={styles.suggestionList}
            />
          )}
        </Card.Content>
      </Card>

      <Surface style={styles.mapWrapper}>
        <WebView
          ref={webViewRef}
          source={{ html: generateHTML(MAP_URL, LEAFLET_JS, LEAFLET_CSS) }}
          onLoadEnd={() => setIsWebViewLoaded(true)}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          style={{ flex: 1, borderRadius: 10 }}
        />
      </Surface>

      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          icon="map-search"
          onPress={fetchRouteFromGraphHopper}
          style={styles.findBtn}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Checking..." : "Find Route"}
        </Button>
        <Button
          mode="contained"
          icon="refresh"
          onPress={resetMap}
          style={styles.resetBtn}
        >
          Reset
        </Button>
      </View>

      {/* {routeDetails.distance && (
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text variant="titleMedium">Route Details</Text>
            <Text>Distance: {routeDetails.distance} km</Text>
            <Text>Time: {routeDetails.time} minutes</Text>
          </Card.Content>
        </Card>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f6fa",
    padding: 12,
    paddingBottom: 20,
  },
  searchCard: {
    marginBottom: 10,
    elevation: 3,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  input: {
    marginBottom: 8,
  },
  suggestionList: {
    maxHeight: 100,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginBottom: 8,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  mapWrapper: {
    flex: 1,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 8,
    marginBottom: 20, // ensures it's not touching screen bottom
  },
  findBtn: {
    backgroundColor: "green",
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  resetBtn: {
    backgroundColor: "crimson",
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 14,
    color: "#fff",
    paddingVertical: 6,
  },
});

export default FindRouteScreen;