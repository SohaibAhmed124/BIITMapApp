import React from "react";
import { View, StyleSheet, TouchableOpacity, Image, FlatList } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import DashboardCard from "../CustomComponents/DashboardCard";
import { logout } from "../../utils/auth";

const AdminDashboard = () => {
  const navigation = useNavigation();
  const userName = "Admin";

  const handleLogout = async () => {
    logout(navigation);
  };

   const menuItems = [
    { icon: "map-search", title: "Map Layers", screen: "AdminMapLayers" },
    { icon: "account-plus", title: "Employee", screen: "EmployeeModule" },
    { icon: "car", title: "Vehicle", screen: "VehicleModule" },
    { icon: "map-marker-radius", title: "GeoFence", screen: "GeofenceModule" },
    { icon: "office-building", title: "Branch", screen: "BranchModule" },
    { icon: "layers", title: "Assign Layer", screen: "AssignLayer" },
    { icon: "layers", title: "Assigned Layers", screen: "AssignedLayer" },
    { icon: "map-search-outline", title: "Tracking", screen: "AdminEmpTracking" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Dashboard</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={require('../../assets/admin.jpg')}
          style={styles.profileImage}
        />
        <Text style={styles.greeting}>Hello, {userName}</Text>
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
            onPress={() => navigation.navigate(item.screen)} 
          />
        )}
        removeClippedSubviews={false}
      />

      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        <Icon name="logout" size={20} color="#fff" />
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
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: "rgb(73, 143, 235)",
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgb(73, 143, 235)",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
  },
  grid: {
    marginTop: 10,
    paddingBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    elevation: 2,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16,
  },
});

export default AdminDashboard;