import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DashboardCard from "../CustomComponents/DashboardCard";
import EmployeeService from "../Api/EmployeeApi";
import Storage from '../../utils/localStorage'
import { logout } from "../../utils/auth";
import { BASE_URL } from "../Api/BaseConfig";

const EmployeeDashboard = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { icon: "map-marker-radius", title: "My Geofences", screen: "EmpAssignedGeofence" },
    { icon: "car", title: "My Vehicles", screen: "EmpAssignedVehicle" },
    { icon: "alert-circle-outline", title: "My Violations", screen: "EmpViolation" },
    // { icon: "crosshairs-gps", title: "Live Tracking", screen: "EmployeeTracking" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const u = await Storage.get("user");
      setUser(u);
      try {
        const [profileRes, geofenceRes] = await Promise.all([
          EmployeeService.getProfile(u.employee_id),
          EmployeeService.getAssignedGeofences(u.employee_id),
        ]);
        setProfile(profileRes.profile);
        setGeofences(geofenceRes.geofences || []);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgb(73, 143, 235)" />
      </View>
    );
  }

  const handleLogout = async () => {
    logout(navigation);
  };

  const authorizedCount = geofences.filter(g => g.access_type === "Authorized").length;
  const restrictedCount = geofences.filter(g => g.access_type === "Restricted").length;
  const violationCount = geofences.filter(g => g.is_violating).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Dashboard</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={
            profile?.image
              ? { uri: `${BASE_URL}${profile.image}` }
              : require("../../assets/default_vehicle.png") // Fallback image
          }
          style={styles.profileImage}
        />
        <Text style={styles.greeting}>Hello, {profile.first_name} 👋</Text>
        <Text style={styles.profileDetail}>{profile.city}, {profile.address}</Text>
        <Text style={styles.profileDetail}>📞 {profile.phone}</Text>
      </View>

      {/* Geofence & Vehicle Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Icon name="map-marker-check-outline" size={28} color="#4a90e2" />
          <Text style={styles.statCount}>{authorizedCount}</Text>
          <Text style={styles.statLabel}>Authorized</Text>
        </View>
        <View style={styles.statBox}>
          <Icon name="map-marker-off-outline" size={28} color="#f39c12" />
          <Text style={styles.statCount}>{restrictedCount}</Text>
          <Text style={styles.statLabel}>Restricted</Text>
        </View>
        <View style={styles.statBox}>
          <Icon name="alert" size={28} color="#e74c3c" />
          <Text style={styles.statCount}>{violationCount}</Text>
          <Text style={styles.statLabel}>Violating</Text>
        </View>
      </View>

      {/* Grid List */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.screen}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <DashboardCard
            icon={item.icon}
            title={item.title}
            onPress={() => navigation.navigate(item.screen, { employeeId:user.employee_id, employeeName: `${profile.first_name} ${profile.last_name}`, geofences })}
          />
        )}
        removeClippedSubviews={false}
      />
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginTop: 20,
          backgroundColor: "#e74c3c",
          padding: 12,
          borderRadius: 8,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Logout</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    padding: 15,
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
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  profileDetail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 10,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    width: "30%",
    elevation: 2,
  },
  statCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 1,
  },
  vehicleText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  grid: {
    marginTop: 20,
    justifyContent: "space-around",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EmployeeDashboard;
