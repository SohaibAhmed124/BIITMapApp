import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import api from "../Api/ManagerApi";
import Ionicons from "react-native-vector-icons/Ionicons";


const TrackingScreen = ({ managerId = 1 }) => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeLocation, setEmployeeLocation] = useState(null);
    const [geofences, setGeofences] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showLocation, setShowLocation] = useState(true);
    const [showGeofences, setShowGeofences] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedGeofence, setSelectedGeofence] = useState(null);
    const webViewRef = useRef(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.getEmployeesByManager(managerId);
            setEmployees(res.employees);
            setFilteredEmployees(res.employees);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchEmployeeDetails = async (employeeId) => {
        setLoading(true);
        try {
            const locationRes = await api.getEmployeeLocation(employeeId);
            const geofenceRes = await api.getAssignedGeofences({ employeeId });
            setEmployeeLocation(locationRes.employeeLocations);
            setGeofences(geofenceRes.geofences);
            setSelectedEmployee(employeeId);
            setTimeout(() => {
                sendMapData(locationRes.employeeLocations, geofenceRes.geofences);
            }, 500);
        } catch (error) {
            console.error("Error fetching tracking data:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendMapData = (location, geofences) => {
        const jsCode = `
      updateMap(${JSON.stringify(location)}, ${JSON.stringify(geofences)});
      true;
    `;
        webViewRef.current.injectJavaScript(jsCode);
    };


    const handleSearch = (text) => {
        setSearchText(text);
        const filtered = employees.filter((emp) =>
            `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredEmployees(filtered);
    };

    const handleToggleLocation = () => {
        setShowLocation(!showLocation);
        if (selectedEmployee && employeeLocation) {
            sendMapData(!showLocation ? employeeLocation : null, geofences);
        }
    };

    const handleToggleGeofences = () => {
        setShowGeofences(!showGeofences);
        if (selectedEmployee && geofences.length) {
            sendMapData(employeeLocation, !showGeofences ? geofences : []);
        }
    };

    const renderEmployeeItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.employeeItem,
                selectedEmployee === item.employee_id && styles.selectedEmployee,
            ]}
            onPress={() => fetchEmployeeDetails(item.employee_id)}
        >
            <Text style={styles.employeeName}>{`${item.first_name} ${item.last_name}`}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search employee..."
                value={searchText}
                onChangeText={handleSearch}
            />

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.toggleButton} onPress={handleToggleLocation}>
                    <Ionicons
                        name={showLocation ? "location" : "location-outline"}
                        size={24}
                        color="white"
                    />
                    <Text style={styles.toggleText}>Location</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toggleButton} onPress={handleToggleGeofences}>
                    <Ionicons
                        name={showGeofences ? "map" : "map-outline"}
                        size={24}
                        color="white"
                    />
                    <Text style={styles.toggleText}>Geofences</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredEmployees}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.employee_id.toString()}
                renderItem={renderEmployeeItem}
                style={styles.employeeList}
            />

            <View style={styles.mapContainer}>
                {loading && <ActivityIndicator size="large" color="blue" style={styles.loading} />}
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
                        } catch (error) {
                            console.error("Error parsing WebView message:", error);
                        }
                    }}

                />
            </View>
            {selectedGeofence && (
                <View style={styles.geofenceCard}>
                    <Text style={styles.geofenceTitle}>{selectedGeofence.geofence_name}</Text>
                    <Text>Status: {selectedGeofence.is_violating ? "Violating" : "Safe"}</Text>
                    <Text>Assigned To: {selectedGeofence.assigned_employee?.first_name} {selectedGeofence.assigned_employee?.last_name}</Text>

                    <TouchableOpacity onPress={() => setSelectedGeofence(null)}>
                        <Text style={{ color: "blue", marginTop: 6 }}>Close</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: "#fff",
    },
    searchBar: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 8,
    },
    toggleButton: {
        flexDirection: "row",
        backgroundColor: "#3b82f6",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    toggleText: {
        color: "white",
        marginLeft: 6,
    },
    employeeList: {
        maxHeight: 50,
        marginBottom: 8,
    },
    employeeItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#f1f5f9",
        borderRadius: 8,
        marginRight: 8,
    },
    selectedEmployee: {
        backgroundColor: "#3b82f6",
    },
    employeeName: {
        color: "#000",
    },
    mapContainer: {
        flex: 1,
        overflow: "hidden",
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
    geofenceCard: {
        position: "absolute",
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    geofenceTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    }
});

export default TrackingScreen;
