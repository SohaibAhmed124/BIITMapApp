import React from "react";
import { View, StyleSheet, TouchableOpacity, Image, FlatList } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import DashboardCard from "../CustomComponents/DashboardCard";
import { logout } from "../../utils/auth";

const MapAdminDashboard = () => {
  const navigation = useNavigation();
  const userName = "MapAdmin";

  const handleLogout = async () => {
    logout(navigation);
  };

  const menuItems = [
    { icon: "account-plus", title: "Employee", screen: "AddLocation" },
    { icon: "car", title: "Vehicle", screen: "GetLocation" },
    { icon: "map-marker-radius", title: "GeoFence", screen: "CreateRoute" },
    { icon: "office-building", title: "Branch", screen: "FindRoute" },
    { icon: "office-building", title: "Branch", screen: "EmpMovSimulator" },
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
          source={{ uri: "https://logodownload.org/wp-content/uploads/2019/07/udemy-logo-5.png" }}
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
          <DashboardCard icon={item.icon} title={item.title} onPress={() => navigation.navigate(item.screen)} />
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
    backgroundColor: "#F4F7FC", // Light gray-blue background
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
  grid: {
    marginTop: 30,
    justifyContent: "space-around",
  },
});

export default MapAdminDashboard;
