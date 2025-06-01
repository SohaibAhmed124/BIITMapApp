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
        if (!selectedEmployee) return;

        const interval = setInterval(() => {
            console.log("Auto-refreshing...");
            fetchEmployeeDetails(selectedEmployee);
            fetchAndDrawTrail(selectedEmployee, currentFilter);
        }, 30000); // every 30s

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

    const fetchEmployeeDetails = async (employeeId) => {
        setLoading(true);
        try {
            const locationRes = await api.getEmployeeLocation(employeeId);
            const geofenceRes = await api.getAssignedGeofences({ employeeId });
            const employeeRes = await EmployeeService.getProfile(employeeId);
            const imageUrl = `${BASE_URL}${employeeRes.profile.image}`;

            const empData = {
                ...locationRes.employeeLocations,
                employee_image: imageUrl
            };
            setEmployeeLocation(empData);
            setGeofences(geofenceRes.geofences);
            setSelectedEmployee(employeeId);
            sendMapData(empData, geofenceRes.geofences);
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
                    originWhitelist={["*"]}
                    source={require("../../assets/tracking.html")}
                    style={styles.map}
                    javaScriptEnabled
                    domStorageEnabled
                    onMessage={(event) => {
                        try {
                            const data = JSON.parse(event.nativeEvent.data);
                            if (data.type === "geofence_click") {
                                setSelectedGeofence(data.geofence);
                            }
                        } catch (e) {
                            console.error("Error parsing WebView message:", e);
                        }
                    }}
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

            {selectedGeofence && (
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
    },
    map: {
        flex: 1,
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
