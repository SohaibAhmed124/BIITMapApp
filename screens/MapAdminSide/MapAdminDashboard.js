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
    { icon: "map-marker-plus", title: "Label Location", screen: "AddLocation" },
    { icon: "map-search", title: "Location", screen: "GetLocation" },
    { icon: "map-clock", title: "Create Route", screen: "CreateRoute" },
    { icon: "map-marker-path", title: "Find Route", screen: "FindRoute" },
    { icon: "account-supervisor-circle", title: "Employee Simulator", screen: "EmpMovSimulator" },
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

export default MapAdminDashboard;