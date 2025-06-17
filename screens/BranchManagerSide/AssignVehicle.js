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
import { SelectList } from 'react-native-dropdown-select-list';
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
          AdminService.getAllVehicles()
        ]);
        
        const formattedEmployees = (employeesResponse.employees || []).map(emp => ({
          key: emp.employee_id,
          value: `${emp.first_name} ${emp.last_name}` || `Employee ${emp.employee_id}`
        }));
        
        const formattedVehicles = (vehiclesResponse.vehicles || [])
          .filter(vehicle => vehicle.is_available)
          .map(vehicle => ({
            key: vehicle.vehicle_id,
            value: `${vehicle.model} (${vehicle.year})`
          }));
        
        setEmployees(formattedEmployees);
        setVehicles(formattedVehicles);
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
        [{ text: 'OK' }]
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
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                      <Icon name="arrow-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Assigned Vehicle</Text>
                  </View>

      <View style={styles.content}>
        {/* Employee Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Employee</Text>
          <SelectList
            setSelected={(val) => setSelectedEmployee(val)}
            data={employees}
            save="key"
            placeholder="Select an employee"
            searchPlaceholder="Search employees..."
            boxStyles={styles.dropdownBox}
            inputStyles={styles.dropdownInput}
            dropdownStyles={styles.dropdownList}
            dropdownTextStyles={styles.dropdownText}
            notFoundText="No employees found"
            maxHeight={200}
          />
        </View>

        {/* Vehicle Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Vehicle</Text>
          <SelectList
            setSelected={(val) => setSelectedVehicle(val)}
            data={vehicles}
            save="key"
            placeholder="Select a vehicle"
            searchPlaceholder="Search vehicles..."
            boxStyles={styles.dropdownBox}
            inputStyles={styles.dropdownInput}
            dropdownStyles={styles.dropdownList}
            dropdownTextStyles={styles.dropdownText}
            notFoundText="No available vehicles found"
            maxHeight={200}
          />
        </View>

        {/* Selected Info */}
        {selectedEmployee && selectedVehicle && (
          <View style={styles.selectionInfo}>
            <View style={styles.infoRow}>
              <Icon name="person-outline" size={18} color="#4a90e2" />
              <Text style={styles.infoText}>
                {employees.find(e => e.key === selectedEmployee)?.value}
              </Text>
            </View>
            <View style={[styles.infoRow, { marginTop: 8 }]}>
              <Icon name="car-outline" size={18} color="#4a90e2" />
              <Text style={styles.infoText}>
                {vehicles.find(v => v.key === selectedVehicle)?.value}
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton, 
            (!selectedEmployee || !selectedVehicle) && styles.disabledButton
          ]}
          onPress={handleAssignVehicle}
          disabled={!selectedEmployee || !selectedVehicle || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <Icon name="car-sport-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                Assign Vehicle
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
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
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownInput: {
    color: '#495057',
    fontSize: 15,
  },
  dropdownList: {
    backgroundColor:'#d3def2',
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderRadius: 8,
    marginTop: 5,
  },
  dropdownText: {
    color: '#495057',
  },
  selectionInfo: {
    backgroundColor: '#f1f8ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#343a40',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#b8d4f0',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    color: '#6c757d',
    fontSize: 16,
  },
});

export default AssignVehicleScreen;