import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { format, parseISO } from 'date-fns';

const AssignedGeofenceDetailsScreen = ({ route }) => {
  const { geofence } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{geofence.geofence_name}</Text>
        <Text style={styles.subtitle}>Assigned to Employee #{geofence.employee_id}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="time-outline" size={20} color="#2E86C1" />
          <Text style={styles.sectionTitle}>Time Period</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Start Date:</Text>
          <Text style={styles.detailValue}>
            {format(parseISO(geofence.start_date), 'MMMM d, yyyy')}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>End Date:</Text>
          <Text style={styles.detailValue}>
            {format(parseISO(geofence.end_date), 'MMMM d, yyyy')}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Daily Time:</Text>
          <Text style={styles.detailValue}>
            {geofence.start_time} - {geofence.end_time}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="information-circle-outline" size={20} color="#2E86C1" />
          <Text style={styles.sectionTitle}>Details</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Access Type:</Text>
          <Text style={styles.detailValue}>{geofence.access_type}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Current Status:</Text>
          <Text style={[
            styles.detailValue,
            geofence.is_active ? styles.activeStatus : styles.inactiveStatus
          ]}>
            {geofence.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Violation Detected:</Text>
          <Text style={[
            styles.detailValue,
            geofence.is_violating ? styles.violationStatus : styles.noViolationStatus
          ]}>
            {geofence.is_violating ? 'Yes' : 'No'}
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
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2E86C1',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activeStatus: {
    color: '#4CAF50',
  },
  inactiveStatus: {
    color: '#F44336',
  },
  violationStatus: {
    color: '#F44336',
  },
  noViolationStatus: {
    color: '#4CAF50',
  },
});

export default AssignedGeofenceDetailsScreen;