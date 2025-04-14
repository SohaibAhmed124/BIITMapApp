import React, { useRef, useState } from 'react';
import { View, Alert, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Button } from 'react-native-paper';
import axios from 'axios';
import polyline from '@mapbox/polyline';

const GRAPH_HOPPER_HOST = 'http://192.168.1.11:8989'; // Your GraphHopper API URL

const MapMatchingScreen = () => {
  const webViewRef = useRef(null);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'route_drawn') {
        // Handle the drawn polyline
        const route = data.route;
        mapMatchRoute(route);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const fetchRouteFromGraphHopper = async (route) => {
    try {
      const url = `${GRAPH_HOPPER_HOST}/match?points_encoded=true&points=${route.map(pt => `${pt.lat},${pt.lon}`).join('&points=')}&locale=en&profile=car`;

      const response = await axios.get(url);
      const { matchedPoints } = response.data;

      if (matchedPoints && matchedPoints.length > 0) {
        const decodedCoords = polyline.decode(matchedPoints[0].points);
        const correctedRoute = decodedCoords.map(([lat, lng]) => ({ lat, lon: lng }));

        // Send the corrected route back to WebView
        if (isWebViewLoaded && webViewRef.current) {
          webViewRef.current.injectJavaScript(`window.displayRoute(${JSON.stringify(correctedRoute)}); true;`);
        }
      } else {
        Alert.alert('Error', 'No map-matched route found.');
      }
    } catch (error) {
      console.error('Error fetching map-matched route:', error);
      Alert.alert('Error', 'Failed to fetch map-matched route.');
    }
  };

  const mapMatchRoute = (route) => {
    if (!route || route.length === 0) {
      Alert.alert('Error', 'Invalid route.');
      return;
    }

    fetchRouteFromGraphHopper(route);
  };

  const resetMap = () => {
    if (isWebViewLoaded && webViewRef.current) {
      webViewRef.current.injectJavaScript('window.resetMap(); true;');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Map Matching</Text>
      </View>

      <WebView
        ref={webViewRef}
        source={require('../../assets/drawnRoute.html')}  // Path to the HTML file
        onMessage={handleMessage}
        onLoadEnd={() => setIsWebViewLoaded(true)}
        style={styles.map}
      />

      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={resetMap} style={styles.resetBtn}>
          Reset Map
        </Button>
        <Button mode="contained" onPress={() => mapMatchRoute([])} style={styles.matchBtn}>
          Match Route
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(222, 233, 240)',
    padding: 10,
  },
  map: {
    flex: 1,
    marginBottom: 10,
  },
  header: {
    backgroundColor: 'rgb(73, 143, 235)',
    height: 50,
    justifyContent: 'center',
    borderRadius: 20,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  resetBtn: {
    backgroundColor: 'rgb(248, 91, 91)',
    borderRadius: 15,
  },
  matchBtn: {
    backgroundColor: 'rgb(52, 240, 52)',
    borderRadius: 15,
  },
});

export default MapMatchingScreen;
