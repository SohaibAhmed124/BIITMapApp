import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import ManagerApi from '../Api/ManagerApi';
import AdminService from '../Api/AdminApiService';

const API_BASE_URL = 'http://192.168.1.11:3000';

const AssignedVehicleListScreen = ({ navigation, route }) => {
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { managerId } = route.params;

  const fetchAssignedVehicles = async () => {
    try {
      setLoading(true);

      // Step 1: Get employees under the manager
      const employeeResponse = await ManagerApi.getEmployeesByManager(managerId);
      const employees = employeeResponse.employees || [];
      const employeeIds = employees.map(emp => emp.employee_id);

      // Step 2: Get all assigned vehicles
      const assignedResponse = await ManagerApi.getAssignedVehicles();
      const assignments = assignedResponse.vehicles || [];

      // Filter assignments to include only those for manager's employees
      const managerAssignments = assignments.filter(a =>
        employeeIds.includes(a.employee_id)
      );

      if (!managerAssignments.length) {
        setAssignedVehicles([]);
        setFilteredVehicles([]);
        return;
      }

      const vehicleIds = [...new Set(managerAssignments.map(a => a.vehicle_id))];

      // Step 3: Get vehicle details
      const vehicleResponse = await AdminService.getAllVehicles();
      const vehicles = vehicleResponse.vehicles || [];

      // Step 4: Merge assignment with employee and vehicle details
      const enriched = managerAssignments.map(assignment => {
        const emp = employees.find(e => e.employee_id === assignment.employee_id);
        const veh = vehicles.find(v => v.vehicle_id === assignment.vehicle_id);
        if (!emp || !veh) return null;
        return {
          ...veh,
          ...assignment,
          employee_name: `${emp.first_name} ${emp.last_name}`,
          employee_phone: emp.phone,
          employee_image: emp.image,
        };
      }).filter(Boolean);

      setAssignedVehicles(enriched);
      setFilteredVehicles(enriched);
    } catch (error) {
      console.error('Error loading assigned vehicles:', error);
      Alert.alert('Error', 'Failed to load assigned vehicles.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedVehicles();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      setFilteredVehicles(
        assignedVehicles.filter(
          v =>
            v.employee_name.toLowerCase().includes(lower) ||
            v.model.toLowerCase().includes(lower)
        )
      );
    } else {
      setFilteredVehicles(assignedVehicles);
    }
  }, [searchQuery, assignedVehicles]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedVehicles();
  };

  const handlePress = vehicle => {
    navigation.navigate('AssignedVehicleDetails', { vehicle });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Assigned Vehicles</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by employee or vehicle"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* List of assigned vehicles */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map(vehicle => (
            <TouchableOpacity
              key={`${vehicle.employee_id}-${vehicle.vehicle_id}`}
              style={styles.card}
              onPress={() => handlePress(vehicle)}
            >
              <View style={styles.imageWrapper}>
                {vehicle.image ? (
                  <Image
                    source={{ uri: `${API_BASE_URL}/images/vehicles/${vehicle.image}` }}
                    style={styles.vehicleImage}
                    defaultSource={require('../../assets/default_vehicle.png')}
                  />
                ) : (
                  <Icon name="car-outline" size={40} color="#2E86C1" />
                )}
              </View>
              <View style={styles.details}>
                <Text style={styles.vehicleModel}>{vehicle.model}</Text>
                <Text style={styles.employeeName}>{vehicle.employee_name}</Text>
                <Text style={styles.phoneText}>{vehicle.employee_phone}</Text>
              </View>
              <Icon name="chevron-forward-outline" size={22} color="#888" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No assigned vehicles found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin:10,
    paddingVertical: 10,
    paddingHorizontal: 10, // Adjusted padding
    backgroundColor: 'rgb(73, 143, 235)',
    borderRadius: 10, // Added border radius
  },
  backButton: {
    padding: 5, // Hit area for back button
    marginRight: 10, // Space between button and title
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 15,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
  searchBar: {
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 50,
    height: 50,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleImage: {
    width: 50,
    height: 30,
    borderRadius: 4,
  },
  details: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  employeeName: {
    fontSize: 14,
    color: '#444',
  },
  phoneText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default AssignedVehicleListScreen;
