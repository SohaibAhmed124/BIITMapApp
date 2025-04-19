import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Searchbar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../Api/ManagerApi';
import { parseISO, isBefore, isAfter, isWithinInterval } from 'date-fns';

const AssignedGeofenceListScreen = ({ navigation }) => {
  const [assignedGeofences, setAssignedGeofences] = useState([]);
  const [filteredGeofences, setFilteredGeofences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAssignedGeofences = async () => {
    try {
      setLoading(true);
      const employeesResponse = await api.getEmployeesByManager(1);
      const employees = employeesResponse.employees || [];


      // Step 1: Fetch geofences for all employees at once
      const allGeofences = await api.getAssignedGeofences(); // assuming this returns all geofences for all employees
      console.log(allGeofences.geofences)
      // Step 2: Prepare a map of employees by employee_id for easy lookup
      const employeeMap = employees.reduce((acc, employee) => {
        acc[employee.employee_id] = {
          name: `${employee.first_name} ${employee.last_name}`,
          phone: employee.phone,
          image: employee.image
        };
        return acc;
      }, {});

      // Step 3: Filter and merge geofence data with employee information
      const combinedData = allGeofences.geofences
        .filter(geofence => employeeMap[geofence.employee_id]) // Filter geofences that have a matching employee_id
        .map(geofence => {
          const employee = employeeMap[geofence.employee_id];

          // Merge employee data with geofence data
          return {
            ...geofence,
            employee_name: employee.name,
            employee_phone: employee.phone,
            employee_image: employee.image
          };
        });

      console.log(combinedData);




      setAssignedGeofences(combinedData);
      setFilteredGeofences(combinedData);
    } catch (error) {
      console.error('Error fetching assigned geofences:', error);
      Alert.alert('Error', 'Failed to load assigned geofences');
      setAssignedGeofences([]);
      setFilteredGeofences([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedGeofences();
  }, []);

  useEffect(() => {
    const results = [...assignedGeofences];
    const now = new Date();

    if (searchQuery) {
      const filtered = results.filter(item => {
        const employeeName = item?.employee_name?.toLowerCase() || '';
        const geofenceName = item?.geofence_name?.toLowerCase() || '';
        return (
          employeeName.includes(searchQuery.toLowerCase()) ||
          geofenceName.includes(searchQuery.toLowerCase())
        );
      });
      setFilteredGeofences(filtered);
      return;
    }

    if (activeFilter !== 'all') {
      const filtered = results.filter(item => {
        if (!item?.start_date || !item?.end_date) return false;
        const startDate = parseISO(item.start_date);
        const endDate = parseISO(item.end_date);

        if (activeFilter === 'active') {
          return isWithinInterval(now, { start: startDate, end: endDate }) && item.is_active;
        } else if (activeFilter === 'upcoming') {
          return isBefore(now, startDate);
        } else if (activeFilter === 'expired') {
          return isAfter(now, endDate);
        }
        return true;
      });
      setFilteredGeofences(filtered);
      return;
    }

    setFilteredGeofences(results);
  }, [searchQuery, activeFilter, assignedGeofences]);

  const renderGeofenceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('AssignedGeofenceDetails', {
          geofence: item,
          employee: {
            name: item.employee_name,
            phone: item.employee_phone,
            image: item.employee_image
          }
        })
      }
    >
      <View style={styles.cardRow}>
        <Text style={styles.label}>Employee:</Text>
        <Text style={styles.value}>{item.employee_name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Geofence:</Text>
        <Text style={styles.value}>{item.geofence_name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Status:</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.start_date, item.end_date, item.is_active) }]}>
          <Text style={styles.statusText}>
            {getStatus(item.start_date, item.end_date, item.is_active).toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
        <Text>Loading geofences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Assigned Geofences</Text>
      </View>

      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search by employee or geofence"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          {['all', 'active', 'upcoming', 'expired'].map(filter => (
            <Chip
              key={filter}
              selected={activeFilter === filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.chip,
                { backgroundColor: activeFilter === filter ? '#2E86C1' : '#e0e0e0' }
              ]}
              textStyle={{
                color: activeFilter === filter ? 'white' : '#333'
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {filteredGeofences.length > 0 ? (
        <FlatList
          data={filteredGeofences}
          keyExtractor={(item, index) => `${item.employee_id}-${item.geo_id}-${index}`}
          renderItem={renderGeofenceItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchAssignedGeofences}
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No assigned geofences found</Text>
        </View>
      )}
    </View>
  );
};

// Helper functions
const getStatus = (startDate, endDate, isActive) => {
  if (!isActive) return 'inactive';
  const now = new Date();
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isBefore(now, start)) return 'upcoming';
  if (isAfter(now, end)) return 'expired';
  return 'active';
};

const getStatusColor = (startDate, endDate, isActive) => {
  const status = getStatus(startDate, endDate, isActive);
  const colors = {
    active: '#4CAF50',
    upcoming: '#FFC107',
    expired: '#F44336',
    inactive: '#9E9E9E'
  };
  return colors[status] || '#9E9E9E';
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  filterContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
  searchBar: {
    marginBottom: 10,
    borderRadius: 8,
  },
  chipContainer: {
    paddingVertical: 5,
  },
  chip: {
    marginRight: 8,
    height: 32,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 10,
    padding: 12,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    marginRight: 6,
  },
  value: {
    flex: 1,
    color: '#555',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AssignedGeofenceListScreen;
