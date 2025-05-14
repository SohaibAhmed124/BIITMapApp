import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useEmployeeContext } from '../Context/EmployeeContext';
import { WebView } from 'react-native-webview';
import EmployeeService from '../Api/EmployeeApi'; // Adjust based on your project
import ManagerApi from '../Api/ManagerApi';
import Header from './EmpHeader';

const Id = 2;

const ManagerDashboardScreen = () => {
  const [employeeLocation, setEmployeeLocation] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const [isViolating, setIsViolating] = useState(false);
  const [html, setHtml] = useState('');
  const { employeeId, setEmployeeId } = useEmployeeContext(); 
  const navigation = useNavigation();

  useEffect(() => {
    setEmployeeId(2);
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const locResponse = await ManagerApi.getEmployeeLocation(Id);
      const location = locResponse.employeeLocations;

      const geoResponse = await EmployeeService.getAssignedGeofences(Id);
      const assignedGeofences = geoResponse.geofences || [];

      const violation = assignedGeofences.some(g => g.is_violating);
      setIsViolating(violation);
      setEmployeeLocation(location);
      setGeofences(assignedGeofences);

      // Now generate HTML with injected values
      const generatedHtml = generateHtml(location, assignedGeofences);
      setHtml(generatedHtml);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const generateHtml = (location, geofences) => {
    const geofencePolygons = geofences.map(g => {
      const coords = g.geofence_boundary
        .map(c => `[${c.latitude}, ${c.longitude}]`)
        .join(',');
      const color = g.is_violating
        ? 'red'
        : 'green';
      return `
        L.polygon([${coords}], {
          color: "${color}",
          weight: 2,
          fillOpacity: 0.4
        }).addTo(map);
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style> html, body, #map { height: 100%; margin: 0; padding: 0; } </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${location.latitude}, ${location.longitude}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          L.marker([${location.latitude}, ${location.longitude}]).addTo(map)
            .bindPopup('Employee: ${location.first_name} ${location.last_name}');

          ${geofencePolygons.join('\n')}
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
        {/* Custom Header */}
    {/* <View style={styles.customHeader}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
        <Text style={styles.menuButton}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Manager Dashboard</Text>
    </View> */}
      <Header title='Manager Dashboard'/>
      {html ? (
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          style={styles.map}
        />
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      )}

      <View style={styles.violationBar}>
        <Text style={styles.violationText}>
          Violation Status: {isViolating ? '❌ In Violation' : '✅ Compliant'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  violationBar: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  violationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default ManagerDashboardScreen;
