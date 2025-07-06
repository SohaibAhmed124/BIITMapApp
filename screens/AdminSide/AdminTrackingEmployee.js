import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import api from "../../Api/ManagerApi";
import AdminService from "../../Api/AdminApiService";
import EmployeeService from "../../Api/EmployeeApi";
import { BASE_URL } from "../../Api/BaseConfig";
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button, Card, IconButton, List, ActivityIndicator, Text, Chip } from "react-native-paper";
import { MultipleSelectList } from "react-native-dropdown-select-list";
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
                preferCanvas: true,
                zoomControl: false
            }).setView([33.6844, 73.0479], 12);
        L.tileLayer('${MAP_URL}', {
            maxZoom: 19,
            attribution: ''
        }).addTo(map);

        L.control.zoom({
            position: 'topleft'
        }).addTo(map);

        // Global references for map elements
        let locationMarkers = {};
        let geofenceLayers = [];
        let trailPolylines = {};

        // Employee trail drawing function
        function drawEmployeeTrail(employeeId, points) {
            if (trailPolylines[employeeId]) {
                map.removeLayer(trailPolylines[employeeId]);
            }
            
            if (points && points.length > 0) {
                const latlngs = points.map(p => [p.latitude, p.longitude]);
                trailPolylines[employeeId] = L.polyline(latlngs, {
                    color: getColorForEmployee(employeeId),
                    dashArray: '5, 10'
                }).addTo(map);
                
                // Fit bounds only if there's more than one point
                if (points.length > 1) {
                    map.fitBounds(trailPolylines[employeeId].getBounds(), { padding: [50, 50] });
                }
            }
        }

        // Get a consistent color for each employee based on their ID
        function getColorForEmployee(employeeId) {
            const colors = ['blue', 'red', 'green', 'purple', 'orange', 'darkred', 'darkblue', 'darkgreen'];
            return colors[parseInt(employeeId) % colors.length];
        }

        // Main map update function
        function updateMap(employeeLocations, geofences) {
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
                    }
                });
            }

            // Handle employee locations
            if (employeeLocations && employeeLocations.length > 0) {
                // Remove markers for employees not in the current list
                Object.keys(locationMarkers).forEach(id => {
                    if (!employeeLocations.some(emp => emp.employee_id === id)) {
                        map.removeLayer(locationMarkers[id]);
                        delete locationMarkers[id];
                    }
                });

                // Add/update markers for current employees
                employeeLocations.forEach(employeeLocation => {
                    const { employee_id, latitude, longitude, first_name, last_name, employee_image } = employeeLocation;

                    // Remove old marker if exists
                    if (locationMarkers[employee_id]) {
                        map.removeLayer(locationMarkers[employee_id]);
                    }

                    // Create marker HTML
                    const iconHtml = [
                        '<div style="',
                        'border: 3px solid ' + getColorForEmployee(employee_id) + ';',
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

                    locationMarkers[employee_id] = L.marker([latitude, longitude], {
                        icon: customIcon,
                        riseOnHover: true
                    }).addTo(map);

                    locationMarkers[employee_id].bindPopup(first_name + " " + last_name);
                });
            } else {
                // Clean up if no locations
                Object.values(locationMarkers).forEach(marker => map.removeLayer(marker));
                locationMarkers = {};
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

const AdminTrackingScreen = ({ navigation }) => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const prevSelectedRef = useRef([]);
    const [employeeLocations, setEmployeeLocations] = useState([]);
    const [geofences, setGeofences] = useState([]);
    const [showLocations, setShowLocations] = useState(true);
    const [showGeofences, setShowGeofences] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedGeofence, setSelectedGeofence] = useState(null);
    const [currentFilter, setCurrentFilter] = useState('Initial');
    const webViewRef = useRef(null)
    const slideAnim = useRef(new Animated.Value(200)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchEmployees();
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
        if (selectedEmployees.length === 0) return;

        const interval = setInterval(() => {
            console.log("Auto-refreshing...");
            fetchEmployeeDetails(selectedEmployees);
            selectedEmployees.forEach(employeeId => {
                fetchAndDrawTrail(employeeId, currentFilter);
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [selectedEmployees, currentFilter]);

    const handleCloseCard = () => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 200, duration: 300, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => setSelectedGeofence(null));
    };

    const fetchEmployees = async () => {
        try {
            const res = await AdminService.getAllUsers();
            const filteredEmp = res.users.filter(user => user.role === 'Employee').map(emp => ({
                key: emp.employee_id,
                value: `${emp.first_name} ${emp.last_name}`
            }))
            console.log(filteredEmp)
            setEmployees(filteredEmp);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchEmployeeDetails = async (employeeIds) => {
        setLoading(true);
        try {
            const locations = [];
            const allGeofences = [];

            for (const employeeId of employeeIds) {
                const [locationRes, geofenceRes, employeeRes] = await Promise.all([
                    api.getEmployeeLocation(employeeId),
                    api.getAssignedGeofences({ employeeId }),
                    EmployeeService.getProfile(employeeId)
                ]);

                if (locationRes.employeeLocations) {
                    const imageUrl = `${BASE_URL}${employeeRes.profile.image}`;
                    locations.push({
                        ...locationRes.employeeLocations,
                        employee_id: employeeId,
                        employee_image: imageUrl
                    });
                }

                if (geofenceRes.geofences) {
                    const now = new Date();
                    const processedGeofences = geofenceRes.geofences.map(geo => ({
                        ...geo,
                        isExpired: new Date(geo.end_date) < now,
                        employee_name: `${employeeRes.profile.first_name} ${employeeRes.profile.last_name}`
                    }));
                    allGeofences.push(...processedGeofences);
                }
            }

            setEmployeeLocations(locations);
            setGeofences(allGeofences);
            sendMapData(locations, allGeofences);
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
            webViewRef.current.injectJavaScript(
                `drawEmployeeTrail('${employeeId}', ${JSON.stringify(filtered)});`
            );
        } catch (error) {
            console.error('Failed to fetch employee trail', error);
        }
    };

    const filterLocationsByTime = (locations, filter) => {
        const now = dayjs();
        if (filter === 'Initial') {
            return locations.sort((a, b) => new Date(b.location_timestamp) - new Date(a.location_timestamp))
                .slice(0, 5)
                .reverse();
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

    const sendMapData = (locations, geofences) => {
        webViewRef.current.injectJavaScript(
            `updateMap(${JSON.stringify(locations)}, ${JSON.stringify(geofences)}); true;`
        );
    };

    const toggleLocations = () => {
        setShowLocations(!showLocations);
        sendMapData(!showLocations ? employeeLocations : [], showGeofences ? geofences : []);
    };

    const toggleGeofences = () => {
        setShowGeofences(!showGeofences);
        sendMapData(showLocations ? employeeLocations : [], !showGeofences ? geofences : []);
    };

    const handleSelectionChange = (newSelected) => {
        prevSelectedRef.current = [...selectedEmployees]; // Save current before update
        setSelectedEmployees(newSelected);
    };

    const handleEmployeeSelection = (currentSelected) => {
        const prevSelected = prevSelectedRef.current;

        const removedEmployees = prevSelected.filter(id => !currentSelected.includes(id));

        removedEmployees.forEach(employeeId => {
            webViewRef.current?.injectJavaScript(
                `drawEmployeeTrail('${employeeId}', []);`
            );
        });

        if (currentSelected.length > 0) {
            fetchEmployeeDetails(currentSelected);
            currentSelected.forEach(employeeId => {
                fetchAndDrawTrail(employeeId, 'Initial');
            });
            setCurrentFilter('Initial');
        } else {
            setEmployeeLocations([]);
            setGeofences([]);
            sendMapData([], []);
        }
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
                    <Chip
                        icon="crosshairs-gps"
                        selected={showLocations}
                        onPress={toggleLocations}
                    >
                        Locations ({selectedEmployees.length})
                    </Chip>
                    <Chip
                        icon="map-marker-radius"
                        selected={showGeofences}
                        onPress={toggleGeofences}
                    >
                        Geofences
                    </Chip>
                </View>

                <View style={styles.filterButtons}>
                    {['Today', 'This Week', 'All Time'].map(label => (
                        <Button
                            key={label}
                            mode="outlined"
                            onPress={() => {
                                setCurrentFilter(label);
                                selectedEmployees.forEach(employeeId => {
                                    fetchAndDrawTrail(employeeId, label);
                                });
                            }}
                        >
                            {label}
                        </Button>
                    ))}
                </View>

                <MultipleSelectList
                    setSelected={handleSelectionChange}
                    data={employees}
                    save="key"
                    label="Selected Employees"
                    placeholder="Select employees..."
                    searchPlaceholder="Search employees..."
                    notFoundText="No employees found"
                    onSelect={() => {
                        handleEmployeeSelection(selectedEmployees)
                        console.log('Previous Selected Employees:', prevSelectedRef);
                        console.log('Current Selected Employees:', selectedEmployees);
                    }}
                    boxStyles={styles.selectListBox}
                    inputStyles={styles.selectListInput}
                    dropdownStyles={styles.selectListDropdown}
                    badgeStyles={styles.badgeStyles}
                    badgeTextStyles={styles.badgeTextStyles}
                />
            </View>

            <View style={styles.mapContainer}>
                {loading && <ActivityIndicator animating={true} size="large" style={styles.loading} />}
                <WebView
                    ref={webViewRef}
                    source={{ html: TrackingMap(MAP_URL) }}
                    style={styles.map}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    onLoadEnd={() => {
                        console.log('WebView load completed');
                        if (selectedEmployees.length > 0) {
                            fetchEmployeeDetails(selectedEmployees);
                        }
                    }}
                    onMessage={(event) => {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data.type === "geofence_click") {
                            setSelectedGeofence(data.geofence);
                        }
                        if (data.type === "map_ready") {
                            console.log('Map ready received');
                            if (selectedEmployees.length > 0) {
                                fetchEmployeeDetails(selectedEmployees);
                            }
                        }
                    }}
                    onError={(error) => console.error('WebView error:', error)}
                />
                <TouchableOpacity
                    style={styles.refreshFab}
                    onPress={() => {
                        if (selectedEmployees.length > 0) {
                            fetchEmployeeDetails(selectedEmployees);
                            selectedEmployees.forEach(employeeId => {
                                fetchAndDrawTrail(employeeId, currentFilter);
                            });
                            setCurrentFilter('Initial');
                        }
                    }}
                >
                    <Icon name="refresh" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

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
                                description={selectedGeofence.employee_name || "Unknown"}
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
        backgroundColor: "rgb(255,255,255)"
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
        overflow: 'hidden',
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
    selectListBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginVertical: 10,
    },
    selectListInput: {
        fontSize: 16,
    },
    selectListDropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginTop: -10,
    },
    badgeStyles: {
        backgroundColor: 'rgb(73, 143, 235)',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 5,
        marginBottom: 5,
    },
    badgeTextStyles: {
        color: 'white',
        fontSize: 12,
    },
});

export default AdminTrackingScreen;
