import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../Api/ManagerApi';
import AdminService from '../../Api/AdminApiService';

const AssignVehicleScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch employees and available vehicles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesResponse, vehiclesResponse] = await Promise.all([
          api.getEmployeesByManager(1), // Replace with actual managerId
          AdminService.getAllVehicles() // Replace with actual managerId
        ]);
        
        setEmployees(employeesResponse.employees || []);
        setVehicles(vehiclesResponse.vehicles || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignVehicle = async () => {
    if (!selectedEmployee || !selectedVehicle) {
      Alert.alert('Error', 'Please select both employee and vehicle');
      return;
    }

    try {
      setSubmitting(true);
      await api.assignVehicleToEmployee(selectedEmployee, selectedVehicle);
      
      Alert.alert(
        'Success', 
        'Vehicle assigned successfully',
        [{ text: 'OK'/**, onPress: () => navigation.goBack() **/ }]
      );
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Assign Vehicle</Text>
      </View>

      {/* Employee Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Employee</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedEmployee}
            onValueChange={(itemValue) => setSelectedEmployee(itemValue)}
            style={styles.picker}
            dropdownIconColor="#666"
          >
            <Picker.Item label="Select an employee" value={null} />
            {employees.map(employee => (
              <Picker.Item 
                key={employee.employee_id} 
                label={`${employee.first_name} ${employee.last_name}` || `Employee ${employee.employee_id}`} 
                value={employee.employee_id} 
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Vehicle Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Vehicle</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedVehicle}
            onValueChange={(itemValue) => setSelectedVehicle(itemValue)}
            style={styles.picker}
            dropdownIconColor="#666"
          >
            <Picker.Item label="Select a vehicle" value={null} />
            {vehicles
              .filter(vehicle => vehicle.is_available)
              .map(vehicle => (
                <Picker.Item 
                  key={vehicle.vehicle_id} 
                  label={`${vehicle.model} (${vehicle.year})`} 
                  value={vehicle.vehicle_id} 
                />
              ))}
          </Picker>
        </View>
      </View>

      {/* Selected Info */}
      {selectedEmployee && selectedVehicle && (
        <View style={styles.selectionInfo}>
          <Text style={styles.infoText}>
            Assigning {vehicles.find(v => v.vehicle_id === selectedVehicle)?.make}{' '}
            {vehicles.find(v => v.vehicle_id === selectedVehicle)?.model} to{' '}
            {employees.find(e => e.employee_id === selectedEmployee)?.first_name}
          </Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, (!selectedEmployee || !selectedVehicle) && styles.disabledButton]}
        onPress={handleAssignVehicle}
        disabled={!selectedEmployee || !selectedVehicle || submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="car-outline" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Assign Vehicle</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 20,
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
  pickerContainer: {
    margin: 15,
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  picker: {
    width: '100%',
    color: '#333',
  },
  selectionInfo: {
    margin: 15,
    padding: 15,
    backgroundColor: '#e8f4fc',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86C1',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E86C1',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#a0c4e0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default AssignVehicleScreen;