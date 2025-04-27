import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { WebView } from "react-native-webview";
import api from "../Api/ManagerApi";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SelectList } from "react-native-dropdown-select-list";



const TrackingScreen = ({ navigation, route }) => {
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
    const { managerId } = route.params;
    const slideAnim = useRef(new Animated.Value(200)).current; // vertical position
    const opacityAnim = useRef(new Animated.Value(0)).current; // opacity


    useEffect(() => {
        if (selectedGeofence) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [selectedGeofence]);
    

    const handleCloseCard = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 200, // move it down
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0, // fade out
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setSelectedGeofence(null);
        });
    };
    


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


    // const handleSearch = (text) => {
    //     setSearchText(text);
    //     const filtered = employees.filter((emp) =>
    //         `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(text.toLowerCase())
    //     );
    //     setFilteredEmployees(filtered);
    // };

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

    // const renderEmployeeItem = ({ item }) => (
    //     <TouchableOpacity
    //         style={[
    //             styles.employeeItem,
    //             selectedEmployee === item.employee_id && styles.selectedEmployee,
    //         ]}
    //         onPress={() => fetchEmployeeDetails(item.employee_id)}
    //     >
    //         <Text style={styles.employeeName}>{`${item.first_name} ${item.last_name}`}</Text>
    //     </TouchableOpacity>
    // );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Tracking</Text>
            </View>
            {/* <TextInput
                style={styles.searchBar}
                placeholder="Search employee..."
                value={searchText}
                onChangeText={handleSearch}
            /> */}

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

            {/* <FlatList
                data={filteredEmployees}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.employee_id.toString()}
                renderItem={renderEmployeeItem}
                style={styles.employeeList}
                removeClippedSubviews={false}
            /> */}

            <SelectList
                data={employees.map((emp) => ({
                    key: emp.employee_id,
                    value: `${emp.first_name} ${emp.last_name}`,
                }))}
                setSelected={(val) => {
                    const selected = employees.find(emp => `${emp.first_name} ${emp.last_name}` === val);
                    if (selected) {
                        fetchEmployeeDetails(selected.employee_id);
                    }
                }}
                placeholder="Select Employee"
                search={true}
                save="value"
                boxStyles={{
                    backgroundColor: "#f1f5f9",
                    borderRadius: 10,
                    borderColor: "#3b82f6",
                    borderWidth: 1,
                    marginBottom: 8,
                    paddingHorizontal: 7,
                }}
                dropdownStyles={{
                    backgroundColor: "#f1f5f9",
                    borderRadius: 10,
                    borderColor: "#3b82f6",
                    borderWidth: 1,
                }}
                inputStyles={{
                    color: "#000",
                }}
                dropdownItemStyles={{
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                }}
                dropdownTextStyles={{
                    color: "#000",
                }}
                searchPlaceholder="Search employee..."
            />


            <View style={styles.mapContainer}>
                {loading && <ActivityIndicator size="large" color="blue" style={styles.loading} />}
                <WebView
                    ref={webViewRef}
                    originWhitelist={["*"]}
                    source={require("../../assets/tracking.html")}
                    style={styles.map}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
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
    <Animated.View style={[
        styles.geofenceCard,
        { 
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim, // fade effect
        }
    ]}>
        <View style={styles.cardHeader}>
            <Text style={styles.geofenceTitle}>{selectedGeofence.geofence_name}</Text>
            <TouchableOpacity onPress={handleCloseCard}>
                <Ionicons name="close-circle" size={24} color="#3b82f6" />
            </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
            <Text style={styles.cardLabel}>Status:</Text>
            <Text style={styles.cardValue}>
                {selectedGeofence.is_violating ? "🚨 Violating" : "✅ Safe"}
            </Text>

            <Text style={[styles.cardLabel, { marginTop: 8 }]}>Assigned To:</Text>
            <Text style={styles.cardValue}>
                {employeeLocation.first_name} {employeeLocation.last_name}
            </Text>
        </View>
    </Animated.View>
)}




        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: "#fff",
    }, header: {
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
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    cardBody: {
        marginTop: 4,
    },

    geofenceTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111827",
    },

    cardLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
    },

    cardValue: {
        fontSize: 16,
        color: "#111827",
    },

});

export default TrackingScreen;
