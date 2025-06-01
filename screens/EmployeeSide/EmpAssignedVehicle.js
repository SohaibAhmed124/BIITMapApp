import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import EmployeeService from '../../Api/EmployeeApi';
import ManagerApi from '../../Api/ManagerApi';
import { BASE_URL } from '../../Api/BaseConfig';

const EmpAssignedVehicleScreen = ({ route, navigation }) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { employeeId } = route.params;

  useEffect(() => {
    const fetchAssignedVehicle = async () => {
      try {
        const assignedResponse = await ManagerApi.getAssignedVehicles({ employeeId });
        let assign_date = 0;
        if (assignedResponse.vehicles && assignedResponse.vehicles.length > 0) {
          assign_date = assignedResponse.vehicles[0].assign_date;
        }

        const response = await EmployeeService.getAssignedVehicles(employeeId);
        console.log(response.vehicles)
        if (response.vehicles && response.vehicles.length > 0) {
          setVehicle({ ...response.vehicles[0], assign_date });
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

  const renderDetailRow = (icon, label, value) => (
    <View style={styles.detailRow}>
      <Icon name={icon} size={24} color="#2E86C1" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'N/A'}</Text>
    </View>
  );

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Assigned Vehicle</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Vehicle Image */}
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
          <Text style={styles.vehicleTitle}>{vehicle.model || 'N/A'}</Text>
          {vehicle.year && <Text style={styles.vehicleYear}>{vehicle.year}</Text>}
        </View>

        {/* Vehicle Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          {renderDetailRow('information-circle-outline', 'Model:', vehicle.model)}
          {renderDetailRow('calendar-outline', 'Year:', vehicle.year)}
          {renderDetailRow('card-outline', 'Registration #:', 'ISB-423')}
          {renderDetailRow('color-palette-outline', 'Color:', 'White')}
          {renderDetailRow('flame-outline', 'Fuel Type:', 'Petrol')}
          {renderDetailRow('speedometer-outline', 'Mileage:', '20 km/L')}
        </View>

        {/* Assignment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assignment Info</Text>
          {renderDetailRow('calendar-sharp', 'Assigned On:', formatDate(vehicle.assign_date))}
          {renderDetailRow(
            'checkmark-circle-outline',
            'Availability:',
            vehicle.is_available ? 'Available' : 'Not Available'
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
 header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgb(73, 143, 235)",
    borderRadius: 10,
    paddingHorizontal: 10,
    margin:15,
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
    marginBottom: 12,
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
