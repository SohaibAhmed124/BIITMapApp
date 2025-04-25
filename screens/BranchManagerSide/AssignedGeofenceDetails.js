import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { format, parseISO } from 'date-fns';
import { WebView } from 'react-native-webview';

const AssignedGeofenceDetailsScreen = ({ route }) => {
  const { geofence, employee } = route.params;

  // Example geofence polygon coordinates (replace with actual from geofence)
  const coordinates = (geofence?.geofence_boundary).map(coords => [coords.latitude, coords.longitude]) || [
    [24.8614, 67.0099],
    [24.8616, 67.0102],
    [24.8612, 67.0105],
    [24.8609, 67.0100],
    [24.8614, 67.0099] // Closed polygon
  ];

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${coordinates[0][0]}, ${coordinates[0][1]}], 17);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        var latlngs = ${JSON.stringify(coordinates)};
        var polygon = L.polygon(latlngs, { color: 'blue', fillOpacity: 0.4 }).addTo(map);
        map.fitBounds(polygon.getBounds());
      </script>
    </body>
    </html>
  `;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{geofence.geofence_name}</Text>
        <Text style={styles.subtitle}>Assigned to Employee #{geofence.employee_id}</Text>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: leafletHTML }}
          style={{ flex: 1, height: 300 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="time-outline" size={20} color="#2E86C1" />
          <Text style={styles.sectionTitle}>Time Period</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Start Date:</Text>
          <Text style={styles.detailValue}>
            {format(parseISO(geofence.start_date), 'MMMM d, yyyy')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>End Date:</Text>
          <Text style={styles.detailValue}>
            {format(parseISO(geofence.end_date), 'MMMM d, yyyy')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Daily Time:</Text>
          <Text style={styles.detailValue}>
            {geofence.start_time} - {geofence.end_time}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="information-circle-outline" size={20} color="#2E86C1" />
          <Text style={styles.sectionTitle}>Details</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Access Type:</Text>
          <Text style={styles.detailValue}>{geofence.access_type}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Current Status:</Text>
          <Text style={[
            styles.detailValue,
            geofence.is_active ? styles.activeStatus : styles.inactiveStatus
          ]}>
            {geofence.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Violation Detected:</Text>
          <Text style={[
            styles.detailValue,
            geofence.is_violating ? styles.violationStatus : styles.noViolationStatus
          ]}>
            {geofence.is_violating ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2E86C1',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  activeStatus: {
    color: 'green',
  },
  inactiveStatus: {
    color: 'gray',
  },
  violationStatus: {
    color: 'red',
  },
  noViolationStatus: {
    color: 'green',
  },
});

export default AssignedGeofenceDetailsScreen;
