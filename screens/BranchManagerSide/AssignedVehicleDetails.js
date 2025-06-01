import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../Api/BaseConfig';

const AssignedVehicleDetailsScreen = ({ route }) => {
  const { vehicle } = route.params;
  {console.log(vehicle)}

  const handleCallEmployee = () => {
    if (vehicle.employee_phone) {
      const phoneNumber = vehicle.employee_phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
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

      {/* Employee Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assigned Employee</Text>
        
        <View style={styles.employeeCard}>
          {vehicle.employee_image ? (
            <Image 
              source={{ uri: `${BASE_URL}${vehicle.employee_image}` }}
              style={styles.employeeImage}
            />
          ) : (
            <View style={[styles.employeeImage, styles.noEmployeeImage]}>
              <Icon name="person-outline" size={30} color="#ccc" />
            </View>
          )}
          
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{vehicle.employee_name}</Text>
            {vehicle.employee_phone && (
              <TouchableOpacity 
                style={styles.phoneContainer}
                onPress={handleCallEmployee}
              >
                <Icon name="call-outline" size={18} color="#2E86C1" />
                <Text style={styles.employeePhone}>{vehicle.employee_phone}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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

      {/* Assignment Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assignment Details</Text>
        
        {vehicle.assign_date && (
          <View style={styles.detailRow}>
            <Icon name="time-outline" size={24} color="#2E86C1" />
            <Text style={styles.detailLabel}>Assigned Since:</Text>
            <Text style={styles.detailValue}>
              {new Date(vehicle.assign_date).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  employeeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  noEmployeeImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeePhone: {
    fontSize: 16,
    color: '#2E86C1',
    marginLeft: 5,
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
});

export default AssignedVehicleDetailsScreen;