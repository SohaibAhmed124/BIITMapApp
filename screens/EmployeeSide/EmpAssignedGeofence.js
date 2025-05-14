import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Card } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EmployeeService from '../Api/EmployeeApi';

const AssignedGeofenceScreen = () => {
    const employeeId = 2;
    const [selectedGeofence, setSelectedGeofence] = useState(null);
    const [geofences, setGeofences] = useState(null);
    const webviewRef = useRef(null);

    useEffect(() => {
        const fetchAssignedGeofences = async () => {
            try {
                const response = await EmployeeService.getAssignedGeofences(employeeId);
                if (response.geofences && response.geofences.length > 0) {
                    setGeofences(response.geofences);
                }
            } catch (error) {
                console.error('Failed to load assigned geofences', error);
            }
        };
        fetchAssignedGeofences();
    }, []);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
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
        const map = L.map('map').setView([33.6469, 73.0428], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        const geofences = ${JSON.stringify(geofences)};
        geofences.forEach(geo => {
          const latlngs = geo.geofence_boundary.map(coord => [coord.latitude, coord.longitude]);
          const polygon = L.polygon(latlngs, {
            color: (geo.is_violating ? 'red' :  'green'),
            weight: 2,
            fillOpacity: 0.4
          }).addTo(map);
          polygon.on('click', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ geo_id: geo.geo_id }));
          });
        });
      </script>
    </body>
    </html>
  `;

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            const found = geofences.find(g => g.geo_id === data.geo_id);
            if (found) {
                setSelectedGeofence(found);
            }
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    };

    const closePopup = () => {
        setSelectedGeofence(null);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Assigned Geofences</Text>
            </View>

            {/* Map */}
            <WebView
                ref={webviewRef}
                source={{ html }}
                style={styles.map}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                onMessage={handleMessage}
            />

            {/* Pop-up Card */}
            {selectedGeofence && (
                <View style={styles.popup}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <Text style={styles.title}>{selectedGeofence.geofence_name}</Text>
                                <TouchableOpacity onPress={closePopup}>
                                    <Ionicons name="close-circle" size={24} color="#888" />
                                </TouchableOpacity>
                            </View>
                            <Text>Access: {selectedGeofence.access_type}</Text>
                            <Text>Start Date: {new Date(selectedGeofence.start_date).toLocaleDateString()}</Text>
                            <Text>End Date: {new Date(selectedGeofence.end_date).toLocaleDateString()}</Text>
                            <Text>Time: {selectedGeofence.start_time} - {selectedGeofence.end_time}</Text>
                            <Text>Status: {selectedGeofence.is_active ? 'Active' : 'Inactive'}</Text>
                            <Text>Violating: {selectedGeofence.is_violating ? 'Yes' : 'No'}</Text>
                        </Card.Content>
                    </Card>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        backgroundColor: '#4a90e2',
        padding: 16,
        paddingTop: 40,
    },
    headerText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    map: { flex: 1, margin: 8, borderRadius: 12, overflow: 'hidden' },
    popup: {
        position: 'absolute',
        bottom: 16,
        width: '100%',
        paddingHorizontal: 16,
    },
    card: {
        borderRadius: 16,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AssignedGeofenceScreen;
