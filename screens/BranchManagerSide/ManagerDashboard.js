import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { logout } from "../../utils/auth";
import EmployeeService from "../Api/EmployeeApi";
import DashboardCard from "../CustomComponents/DashboardCard";
import Storage from '../../utils/localStorage';
import { BASE_URL } from "../Api/BaseConfig";

const ManagerDashboard = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { icon: "account-plus", title: "Assign Geofence", screen: "AssignGeofence" },
    { icon: "car", title: "Assign Vehicle", screen: "AssignVehicle" },
    { icon: "map-marker-radius", title: "Assigned Geofence", screen: "AssignedGeofences" },
    { icon: "car-multiple", title: "Assigned Vehicle", screen: "AssignedVehicles" },
    { icon: "map-search-outline", title: "Tracking", screen: "EmployeeTracking" },
    { icon: "alert-outline", title: "Violation", screen: "ViewViolation" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const u = await Storage.get("user");
      setUser(u);
      try {
        const profileRes = await EmployeeService.getProfile(u.employee_id);
        setProfile(profileRes.profile);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Manager Dashboard</Text>
      </View>

      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Image
            source={
              profile?.image
                ? { uri: `${BASE_URL}${profile.image}` }
                : require("../../assets/default_vehicle.png")
            }
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.greeting}>Hello, {profile.first_name}</Text>
            <View style={styles.infoRow}>
              <Icon name="email" size={18} color="#498FEB" style={styles.icon} />
              <Text style={styles.profileDetail}>{profile.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="city" size={18} color="#498FEB" style={styles.icon} />
              <Text style={styles.profileDetail}>{profile.city}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone" size={18} color="#498FEB" style={styles.icon} />
              <Text style={styles.profileDetail}>{profile.phone}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Grid List */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.screen}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <DashboardCard icon={item.icon} title={item.title} onPress={() => navigation.navigate(item.screen, { managerId: user.manager_id })} />
        )}
        removeClippedSubviews={false}
      />

      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutText}>Logout</Text>
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
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 15,
  },
  profileCard: {
    marginTop: 20,
    elevation: 2,
    borderRadius: 10,
    backgroundColor: "#EAF1FB",
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  profileDetail: {
    fontSize: 14,
    color: "#444",
  },
  grid: {
    marginTop: 30,
    justifyContent: "space-around",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ManagerDashboard;
