import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import api from "../../Api/ManagerApi";
import EmployeeService from "../../Api/EmployeeApi";
import { BASE_URL } from "../../Api/BaseConfig";
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button, Card, IconButton, List, ActivityIndicator, Text, Chip } from "react-native-paper";
import { SelectList } from "react-native-dropdown-select-list";
import { MAP_URL } from "../../Api/BaseConfig";


const TrackingMap = (MAP_URL) => `<!DOCTYPE html>
<html>
<head>
    <title>Employee Tracker</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
    <style>
        html,
        body,
        #map {
            height: 100%;
            margin: 0;
            padding: 0;
        }

        .employee-marker {
            border: 3px solid blue;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            overflow: hidden;
            box-shadow: 0 0 5px #000;
            transition: all 0.3s ease;
        }

        .employee-marker img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: opacity 0.3s ease;
        }

        .loading-image {
            opacity: 0;
        }

        .loaded-image {
            opacity: 1;
        }
    </style>
</head>
<body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
    <script>
        // Initialize map with dynamic MAP_URL
        const map = L.map("map",{
                preferCanvas: true,  // Better for mobile performance
                zoomControl: false   // We'll add our own
            }).setView([33.6844, 73.0479], 12);
        L.tileLayer('${MAP_URL}', {
            maxZoom: 19,
            attribution: ''
        }).addTo(map);

         // Add zoom control with proper position
        L.control.zoom({
            position: 'topleft'
        }).addTo(map);

        // Global references for map elements
        let locationMarker = null;
        let geofenceLayers = [];
        let trailPolyline = null;

        // Employee trail drawing function
        function drawEmployeeTrail(points) {
            if (trailPolyline) {
                map.removeLayer(trailPolyline);
            }
            const latlngs = points.map(p => [p.latitude, p.longitude]);
            trailPolyline = L.polyline(latlngs, {
                color: 'blue',
                dashArray: '5, 10'
            }).addTo(map);
            map.fitBounds(trailPolyline.getBounds(), { padding: [50, 50] });
        }

        // Main map update function
        function updateMap(employeeLocation, geofences) {
            // Clear old geofences
            geofenceLayers.forEach(layer => map.removeLayer(layer));
            geofenceLayers = [];

            // Get current time
            const now = new Date();

            // Add new geofences
            if (geofences && geofences.length > 0) {
                geofences.forEach((geo) => {
                    const startDate = new Date(geo.start_date);
                    const endDate = new Date(geo.end_date);

                    // Check if geofence is expired
                    const isExpired = now > endDate;

                    const boundary = geo.geofence_boundary.map(coord => [coord.latitude, coord.longitude]);
                    let layer;

                    if (boundary.length > 1) {
                        layer = L.polygon(boundary, {
                            color: isExpired ? 'grey' : (geo.is_violating ? "red" : "green"),
                            fillOpacity: 0.3,
                            weight: isExpired ? 1 : 2
                        }).addTo(map);
                    } else if (boundary.length === 1) {
                        layer = L.circle(boundary[0], {
                            radius: 100,
                            color: isExpired ? 'grey' : (geo.is_violating ? "red" : "green"),
                            fillOpacity: 0.3,
                            weight: isExpired ? 1 : 2
                        }).addTo(map);
                    }

                    if (layer) {
                        layer.on("click", () => {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: "geofence_click",
                                geofence: geo,
                            }));
                        });
                        geofenceLayers.push(layer);

                        // Add expiration status to the popup
                        // if (isExpired) {
                        //     layer.bindPopup('<b>'+geo.geofence_name+'</b><br>Expired on '+geo.end_date);
                        // }
                    }
                });
            }

            // Handle employee location
            if (employeeLocation) {
                const { latitude, longitude, first_name, last_name, employee_image } = employeeLocation;

                // Remove old marker if exists
                if (locationMarker) {
                    map.removeLayer(locationMarker);
                    locationMarker = null;
                }

                // Create marker HTML with proper escaping
                const iconHtml = [
                    '<div style="',
                    'border: 3px solid blue;',
                    'border-radius: 50%;',
                    'width: 50px;',
                    'height: 50px;',
                    'overflow: hidden;',
                    'box-shadow: 0 0 5px #000;',
                    'background-color: #ccc;',
                    'display: flex;',
                    'justify-content: center;',
                    'align-items: center;">',
                    '<img src="', employee_image, '" style="',
                    'width: 100%;',
                    'height: 100%;',
                    'object-fit: cover;" ',
                    'onerror="this.onerror=null; this.src=\\'https://via.placeholder.com/50\\'"/>',
                    '</div>'
                ].join('');

                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: '',
                    iconSize: [50, 50],
                    iconAnchor: [25, 25]
                });

                locationMarker = L.marker([latitude, longitude], {
                    icon: customIcon,
                    riseOnHover: true
                }).addTo(map);

                locationMarker.bindPopup(first_name + " " + last_name);
                // map.setView([latitude, longitude], 15);
            } else {
                // Clean up if no location
                if (locationMarker) {
                    map.removeLayer(locationMarker);
                    locationMarker = null;
                }
            }
        }

        // Make functions available to WebView
        window.updateMap = updateMap;
        window.drawEmployeeTrail = drawEmployeeTrail;
        
        // Notify React Native that map is ready
        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "map_ready"
        }));
    </script>
</body>
</html>`;

const TrackingScreen = ({ navigation, route }) => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeLocation, setEmployeeLocation] = useState(null);
    const [geofences, setGeofences] = useState([]);
    const [showLocation, setShowLocation] = useState(true);
    const [showGeofences, setShowGeofences] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedGeofence, setSelectedGeofence] = useState(null);
    const [currentFilter, setCurrentFilter] = useState('Initial');
    const webViewRef = useRef(null);
    const { managerId } = route.params;
    const slideAnim = useRef(new Animated.Value(200)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchEmployees();;
    }, []);

    useEffect(() => {
        if (selectedGeofence) {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        }
    }, [selectedGeofence]);

    useEffect(() => {
        if (!selectedEmployee) return;

        const interval = setInterval(() => {
            console.log("Auto-refreshing...");
            fetchEmployeeDetails(selectedEmployee);
            fetchAndDrawTrail(selectedEmployee, currentFilter);
        }, 10000); // every 30s

        return () => clearInterval(interval);
    }, [selectedEmployee, currentFilter]);


    const handleCloseCard = () => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 200, duration: 300, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => setSelectedGeofence(null));
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.getEmployeesByManager(managerId);
            setEmployees(res.employees);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    // const fetchEmployeeDetails = async (employeeId) => {
    //     setLoading(true);
    //     try {
    //         const locationRes = await api.getEmployeeLocation(employeeId);
    //         const geofenceRes = await api.getAssignedGeofences({ employeeId });
    //         const employeeRes = await EmployeeService.getProfile(employeeId);
    //         const imageUrl = `${BASE_URL}${employeeRes.profile.image}`;

    //         const empData = {
    //             ...locationRes.employeeLocations,
    //             employee_image: imageUrl
    //         };
    //         setEmployeeLocation(empData);
    //         setGeofences(geofenceRes.geofences);
    //         setSelectedEmployee(employeeId);
    //         console.log(geofenceRes.geofences);
    //         sendMapData(empData, geofenceRes.geofences);
    //     } catch (error) {
    //         console.error("Error fetching tracking data:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const fetchEmployeeDetails = async (employeeId) => {
        setLoading(true);
        try {
            const locationRes = await api.getEmployeeLocation(employeeId);
            const geofenceRes = await api.getAssignedGeofences({ employeeId });
            const employeeRes = await EmployeeService.getProfile(employeeId);
            const imageUrl = `${BASE_URL}${employeeRes.profile.image}`;

            // Add isExpired flag to each geofence
            const now = new Date();
            const processedGeofences = geofenceRes.geofences.map(geo => ({
                ...geo,
                isExpired: new Date(geo.end_date) < now
            }));

            const empData = {
                ...locationRes.employeeLocations,
                employee_image: imageUrl
            };
            setEmployeeLocation(empData);
            setGeofences(processedGeofences);
            setSelectedEmployee(employeeId);
            sendMapData(empData, processedGeofences);
        } catch (error) {
            console.error("Error fetching tracking data:", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchAndDrawTrail = async (employeeId, filter) => {
        try {
            const res = await api.getAllEmployeeLocations(employeeId);
            const filtered = filterLocationsByTime(res.employees, filter);
            webViewRef.current.injectJavaScript(`drawEmployeeTrail(${JSON.stringify(filtered)});`);
        } catch (error) {
            console.error('Failed to fetch employee trail', error);
        }
    };

    const filterLocationsByTime = (locations, filter) => {
        const now = dayjs();
        if (filter === 'Initial') {
            return locations.sort((a, b) => new Date(b.location_timestamp) - new Date(a.location_timestamp)).slice(0, 5).reverse();
        }
        return locations.filter(({ location_timestamp }) => {
            const time = dayjs(location_timestamp);
            switch (filter) {
                case 'Today': return time.isSame(now, 'day');
                case 'This Week': return time.isSame(now, 'week');
                case 'All Time': return true;
                default: return true;
            }
        });
    };

    const sendMapData = (location, geofences) => {
        webViewRef.current.injectJavaScript(`updateMap(${JSON.stringify(location)}, ${JSON.stringify(geofences)}); true;`);
    };

    const toggleLocation = () => {
        setShowLocation(!showLocation);
        sendMapData(!showLocation ? employeeLocation : null, showGeofences ? geofences : []);
    };

    const toggleGeofences = () => {
        setShowGeofences(!showGeofences);
        sendMapData(showLocation ? employeeLocation : null, !showGeofences ? geofences : []);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Tracking</Text>
            </View>

            <View style={styles.controlContainer}>
                <View style={styles.toggleRow}>
                    <Chip icon="crosshairs-gps" selected={showLocation} onPress={toggleLocation}>Location</Chip>
                    <Chip icon="map-marker-radius" selected={showGeofences} onPress={toggleGeofences}>Geofences</Chip>
                </View>

                <View style={styles.filterButtons}>
                    {['Today', 'This Week', 'All Time'].map(label => (
                        <Button key={label} mode="outlined" onPress={() => {
                            setCurrentFilter(label);
                            fetchAndDrawTrail(selectedEmployee, label);
                        }}>{label}</Button>
                    ))}
                </View>
                <SelectList
                    data={employees.map(emp => ({ key: emp.employee_id, value: `${emp.first_name} ${emp.last_name}` }))}
                    setSelected={val => {
                        const selected = employees.find(emp => `${emp.first_name} ${emp.last_name}` === val);
                        if (selected) {
                            fetchEmployeeDetails(selected.employee_id);
                            fetchAndDrawTrail(selected.employee_id, 'Initial');
                            setCurrentFilter('Initial');
                        }
                    }}
                    placeholder="Select Employee"
                    search
                    save="value"
                    boxStyles={{ marginVertical: 10 }}
                />
            </View>

            <View style={styles.mapContainer}>
                {loading && <ActivityIndicator animating={true} size="large" style={styles.loading} />}
                <WebView
                    ref={webViewRef}
                    // source={require("../../assets/tracking.html")}
                    source={{ html: TrackingMap(MAP_URL) }}
                    style={styles.map}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    onLoadEnd={() => {
                        console.log('WebView load completed');
                    }}
                    onMessage={(event) => {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data.type === "geofence_click") {
                            setSelectedGeofence(data.geofence);
                        }
                        if (data.type === "map_ready") {
                            console.log('Map ready received');
                            if (selectedEmployee) {
                                fetchEmployeeDetails(selectedEmployee);
                            }
                        }
                    }}
                    onError={(error) => console.error('WebView error:', error)}
                />
                <TouchableOpacity
                    style={styles.refreshFab}
                    onPress={() => {
                        if (selectedEmployee) {
                            fetchEmployeeDetails(selectedEmployee);
                            fetchAndDrawTrail(selectedEmployee, currentFilter);
                            setCurrentFilter('Initial');
                        }
                    }}
                >
                    <Icon name="refresh" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* {selectedGeofence && (
                <Animated.View style={[styles.geofenceCard, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
                    <Card>
                        <Card.Title title={selectedGeofence.geofence_name} right={() => (
                            <IconButton icon="close-circle" onPress={handleCloseCard} iconColor="rgb(73, 143, 235)" />
                        )} />
                        <Card.Content>
                            <List.Item
                                title="Status"
                                description={selectedGeofence.is_violating ? "Violating" : "Safe"}
                                left={props => <List.Icon {...props} icon={selectedGeofence.is_violating ? "alert-circle" : "check-circle"} color={selectedGeofence.is_violating ? 'red' : 'green'} />}
                            />
                            <List.Item
                                title="Assigned To"
                                description={`${employeeLocation?.first_name} ${employeeLocation?.last_name}`}
                                left={props => <List.Icon {...props} icon="account" />}
                            />
                        </Card.Content>
                    </Card>
                </Animated.View>
            )} */}
            {selectedGeofence && (
                <Animated.View style={[styles.geofenceCard, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
                    <Card>
                        <Card.Title
                            title={selectedGeofence.geofence_name}
                            right={() => (
                                <IconButton icon="close-circle" onPress={handleCloseCard} iconColor="rgb(73, 143, 235)" />
                            )}
                        />
                        <Card.Content>
                            <List.Item
                                title="Status"
                                description={
                                    new Date(selectedGeofence.end_date) < new Date() ? "Expired" :
                                        selectedGeofence.is_violating ? "Violating" : "Safe"
                                }
                                left={props => (
                                    <List.Icon
                                        {...props}
                                        icon={
                                            new Date(selectedGeofence.end_date) < new Date() ? "clock-alert-outline" :
                                                selectedGeofence.is_violating ? "alert-circle" : "check-circle"
                                        }
                                        color={
                                            new Date(selectedGeofence.end_date) < new Date() ? 'grey' :
                                                selectedGeofence.is_violating ? 'red' : 'green'
                                        }
                                    />
                                )}
                            />
                            <List.Item
                                title="Time Range"
                                description={`${dayjs(selectedGeofence.start_date).format('MMM D, YYYY h:mm A')} - ${dayjs(selectedGeofence.end_date).format('MMM D, YYYY h:mm A')}`}
                                left={props => <List.Icon {...props} icon="clock-outline" />}
                            />
                            <List.Item
                                title="Assigned To"
                                description={`${employeeLocation?.first_name} ${employeeLocation?.last_name}`}
                                left={props => <List.Icon {...props} icon="account" />}
                            />
                        </Card.Content>
                    </Card>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: "rgb(73, 143, 235)",
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    backButton: {
        padding: 5,
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginLeft: 15,
    },
    controlContainer: {
        padding: 10,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    filterButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden', // Important
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    loading: {
        position: "absolute",
        top: "50%",
        left: "50%",
        zIndex: 10,
    },
    refreshFab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#3b82f6",
        borderRadius: 30,
        padding: 12,
        elevation: 6,
        zIndex: 10,
    },

    geofenceCard: {
        position: "absolute",
        bottom: 10,
        left: 10,
        right: 10,
    },
});

export default TrackingScreen;
