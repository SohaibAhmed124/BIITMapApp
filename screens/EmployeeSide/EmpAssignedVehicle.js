import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';

import { useEmployeeContext } from '../Context/EmployeeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import EmployeeService from '../Api/EmployeeApi';
import ManagerApi from '../Api/ManagerApi';
import { BASE_URL } from '../Api/BaseConfig';
import Header from './EmpHeader';

const EmpAssignedVehicleScreen = ({ route, navigation }) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { employeeId} = useEmployeeContext(); 

  useEffect(() => {
    const fetchAssignedVehicle = async () => {
      
       try {
        const assignedResponse = await ManagerApi.getAssignedVehicles({employeeId});
        let assign_date = 0;
        if (assignedResponse.vehicles && assignedResponse.vehicles.length > 0) {
          assign_date = assignedResponse.vehicles[0].assign_date;
        }
        
        const response = await EmployeeService.getAssignedVehicles(employeeId);
        if (response.vehicles && response.vehicles.length > 0) {
            setVehicle({...response.vehicles[0], assign_date});
        }

      } catch (error) {
        console.error('Failed to load assigned vehicle', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedVehicle();
  }, [employeeId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E86C1" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 16 }}>No vehicle assigned currently.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      
        {/* Custom Header */}
          {/* <View style={styles.customHeader}>
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
              <Text style={styles.menuButton}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manager Dashboard</Text>
          </View> */}
          <Header title="Assiged Vehicle"/>
          {/* Vehicle Image Section */}
      <View style={styles.imageSection}>
        {vehicle.image ? (
          <Image
            source={{ uri: `${BASE_URL}${vehicle.image}` }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.vehicleImage, styles.noImage]}>
            <Icon name="car-outline" size={60} color="#ccc" />
          </View>
        )}
        <Text style={styles.vehicleTitle}>{vehicle.model}</Text>
        {vehicle.year && (
          <Text style={styles.vehicleYear}>{vehicle.year}</Text>
        )}
      </View>

      {/* Vehicle Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>

        <View style={styles.detailRow}>
          <Icon name="information-circle-outline" size={24} color="#2E86C1" />
          <Text style={styles.detailLabel}>Model:</Text>
          <Text style={styles.detailValue}>{vehicle.model}</Text>
        </View>

        {vehicle.year && (
          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={24} color="#2E86C1" />
            <Text style={styles.detailLabel}>Year:</Text>
            <Text style={styles.detailValue}>{vehicle.year}</Text>
          </View>
        )}
      </View>

      {/* Assignment Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assignment Info</Text>

        <View style={styles.detailRow}>
          <Icon name="calendar-sharp" size={24} color="#2E86C1" />
          <Text style={styles.detailLabel}>Assigned On:</Text>
          <Text style={styles.detailValue}>
            {formatDate(vehicle.assign_date)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="checkmark-circle-outline" size={24} color="#2E86C1" />
          <Text style={styles.detailLabel}>Availability:</Text>
          <Text style={styles.detailValue}>
            {vehicle.is_available ? 'Available' : 'Not Available'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },customHeader: {
  height: 60,
  backgroundColor: '#007AFF',
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
},
menuButton: {
  fontSize: 24,
  color: 'white',
  marginRight: 12,
},
headerTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: 'white',
},
  imageSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  vehicleTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  vehicleYear: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2E86C1',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
    marginRight: 5,
    width: 120,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EmpAssignedVehicleScreen;
