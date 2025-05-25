import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { format, parseISO } from 'date-fns';
import { WebView } from 'react-native-webview';
import { SelectList } from 'react-native-dropdown-select-list';

const AssignedGeofenceDetailsScreen = ({ route, navigation }) => {
    const { geofences, employeeName } = route.params;

    const [selectedGeofenceId, setSelectedGeofenceId] = useState(geofences[0]?.geo_id);
    const [selectedGeofence, setSelectedGeofence] = useState(geofences[0]);

    const geofenceOptions = geofences.map(g => ({
        key: g.geo_id,
        value: g.geofence_name,
    }));

    useEffect(() => {
        const found = geofences.find(g => g.geo_id === selectedGeofenceId);
        if (found) setSelectedGeofence(found);
    }, [selectedGeofenceId]);

    const coordinates =
        selectedGeofence?.geofence_boundary?.map(coords => [coords.latitude, coords.longitude]) || [];

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
            var map = L.map('map').setView([${coordinates[0]?.[0] || 0}, ${coordinates[0]?.[1] || 0}], 17);
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
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Geofence Details</Text>
                <View style={{ width: 24 }} /> {/* For spacing */}
            </View>

            {/* FLOATING DROPDOWN */}
            <View style={styles.dropdownWrapper}>
                <SelectList
                    data={geofenceOptions}
                    setSelected={setSelectedGeofenceId}
                    placeholder="Select Geofence"
                    boxStyles={styles.dropdownBox}
                    dropdownStyles={styles.dropdownList}
                    search={false}
                    save="key"
                    defaultOption={{
                        key: selectedGeofenceId,
                        value: selectedGeofence?.geofence_name || '',
                    }}

                />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>{String(selectedGeofence?.geofence_name)}</Text>
                    <Text style={styles.subtitle}>Assigned to {employeeName}</Text>
                </View>

                <View style={styles.mapContainer}>
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: leafletHTML }}
                        style={{ flex: 1, height: 300 }}
                        javaScriptEnabled
                        domStorageEnabled
                    />
                </View>

                {/* Time Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="time-outline" size={20} color="#2E86C1" />
                        <Text style={styles.sectionTitle}>Time Period</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Start Date:</Text>
                        <Text style={styles.detailValue}>
                            {format(parseISO(selectedGeofence.start_date), 'MMMM d, yyyy')}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>End Date:</Text>
                        <Text style={styles.detailValue}>
                            {format(parseISO(selectedGeofence.end_date), 'MMMM d, yyyy')}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Daily Time:</Text>
                        <Text style={styles.detailValue}>
                            {String(selectedGeofence.start_time)} - {String(selectedGeofence.end_time)}
                        </Text>
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="information-circle-outline" size={20} color="#2E86C1" />
                        <Text style={styles.sectionTitle}>Details</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Access Type:</Text>
                        <Text style={styles.detailValue}>{String(selectedGeofence.access_type)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Current Status:</Text>
                        <Text
                            style={[
                                styles.detailValue,
                                selectedGeofence.is_active ? styles.activeStatus : styles.inactiveStatus,
                            ]}
                        >
                            {String(selectedGeofence.is_active ? 'Active' : 'Inactive')}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Violation Detected:</Text>
                        <Text
                            style={[
                                styles.detailValue,
                                selectedGeofence.is_violating ? styles.violationStatus : styles.noViolationStatus,
                            ]}
                        >
                            {String(selectedGeofence.is_violating ? 'Yes' : 'No')}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        height: 56,
        backgroundColor: '#2E86C1',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 40 : 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    dropdownWrapper: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 100 : 70,
        left: 16,
        right: 16,
        zIndex: 999,
    },
    dropdownBox: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
    },
    dropdownList: {
        zIndex: 1000,
        backgroundColor: '#fff',
    },
    headerContent: {
        marginBottom: 20,
        paddingTop: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
    },
    subtitle: {
        fontSize: 15,
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 17,
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
