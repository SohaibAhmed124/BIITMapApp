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
  Alert
} from 'react-native';
import { DataTable, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import ManagerApi from '../Api/ManagerApi'
import AdminService from '../Api/AdminApiService';

const AssignedVehicleListScreen = ({ navigation }) => {
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAssignedVehicles = async () => {
    try {
      setLoading(true);
      
      // Step 1: Get assigned vehicles from Manager API
      const assignedResponse = await ManagerApi.getAssignedVehicles();
      const assignedVehicleIds = assignedResponse.vehicles || [];
      
      // Step 2: Get full vehicle details from Admin API
      const vehiclesResponse = await AdminService.getAllVehicles();
      const allVehicles = vehiclesResponse.vehicles || [];
      
      // Step 3: Get employee details from Admin API
      const employeesResponse = await AdminService.getAllEmployees();
      const allEmployees = employeesResponse.employees || [];
      
      // Combine all data
      const enrichedVehicles = assignedVehicleIds.map(assignment => {
        const vehicle = allVehicles.find(v => v.vehicle_id === assignment.vehicle_id);
        const employee = allEmployees.find(e => e.employee_id === assignment.employee_id);
        
        return {
          ...vehicle,
          ...assignment,
          employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
          employee_phone: employee?.phone,
          employee_image: employee?.image
        };
      });

      setAssignedVehicles(enrichedVehicles);
      setFilteredVehicles(enrichedVehicles);
    } catch (error) {
      console.error('Error fetching assigned vehicles:', error);
      Alert.alert('Error', 'Failed to load assigned vehicles');
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
      const filtered = assignedVehicles.filter(vehicle =>
        vehicle.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(assignedVehicles);
    }
  }, [searchQuery, assignedVehicles]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedVehicles();
  };

  const navigateToDetails = (vehicle) => {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Assigned Vehicles</Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by employee or vehicle"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Vehicle</DataTable.Title>
            <DataTable.Title>Assigned To</DataTable.Title>
            <DataTable.Title>Modal</DataTable.Title>
          </DataTable.Header>

          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <DataTable.Row 
                key={`${vehicle.employee_id}-${vehicle.vehicle_id}`}
                onPress={() => navigateToDetails(vehicle)}
              >
                <DataTable.Cell>
                  {vehicle.image ? (
                    <Image 
                      source={{ uri: `${API_BASE_URL}/images/vehicles/${vehicle.image}` }} 
                      style={styles.vehicleThumbnail}
                      defaultSource={require('../../assets/default_vehicle.png')}
                    />
                  ) : (
                    <Icon name="car-outline" size={30} color="#2E86C1" />
                  )}
                </DataTable.Cell>
                <DataTable.Cell>
                  <Text style={styles.employeeName}>{vehicle.employee_name}</Text>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Text style={styles.vehicleModel}>{vehicle.model}</Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No assigned vehicles found</Text>
            </View>
          )}
        </DataTable>
      </ScrollView>
    </View>
  );
};

const API_BASE_URL = 'http://192.168.1.11:3000';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2E86C1',
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  vehicleThumbnail: {
    width: 50,
    height: 30,
    borderRadius: 4,
  },
  employeeName: {
    fontWeight: '500',
  },
  employeePhone: {
    fontSize: 12,
    color: '#666',
  },
  vehicleModel: {
    fontWeight: '500',
  },
  vehicleYear: {
    fontSize: 12,
    color: '#666',
  },
});

export default AssignedVehicleListScreen;