import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable, // Changed from TouchableOpacity
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Alert // Added Alert import
} from 'react-native';
import { Searchbar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../Api/ManagerApi'; // Assuming ManagerApi is correctly set up
import { parseISO, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

// Helper functions (assuming these are correct and outside the component)
const getStatus = (startDate, endDate, isActive) => {
    // Check if dates are valid before parsing
    if (!isActive || !startDate || !endDate) return 'inactive';
    try {
        const now = new Date();
        const start = parseISO(startDate);
        const end = parseISO(endDate);

        // Validate parsed dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn("Invalid date format received:", startDate, endDate);
            return 'inactive'; // Treat as inactive if dates are invalid
        }

        if (isBefore(now, start)) return 'upcoming';
        if (isAfter(now, end)) return 'expired';
        return 'active';
    } catch (e) {
        console.error("Error parsing dates:", e);
        return 'inactive'; // Treat as inactive on parsing error
    }
};


const getStatusColor = (startDate, endDate, isActive) => {
  const status = getStatus(startDate, endDate, isActive);
  const colors = {
    active: '#4CAF50', // Green
    upcoming: '#FFC107', // Amber
    expired: '#F44336', // Red
    inactive: '#9E9E9E' // Grey
  };
  return colors[status] || '#9E9E9E';
};

const AssignedGeofenceListScreen = ({ navigation, route }) => {
  const [assignedGeofences, setAssignedGeofences] = useState([]);
  const [filteredGeofences, setFilteredGeofences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { managerId } = route.params;
  // --- Data Fetching ---
  const fetchAssignedGeofences = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
        setLoading(true);
    }
    try {
      // TODO: Replace '1' with dynamic manager ID
      const employeesResponse = await api.getEmployeesByManager(managerId);
      const employees = employeesResponse.employees || [];

      // Fetch all assigned geofences (ideally, API could filter by managerId)
      const allGeofencesResponse = await api.getAssignedGeofences(); // Potentially add { managerId } if API supports
      const allGeofences = allGeofencesResponse.geofences || [];

      const employeeMap = employees.reduce((acc, employee) => {
        acc[employee.employee_id] = {
          name: `${employee.first_name} ${employee.last_name}`,
          phone: employee.phone,
          image: employee.image // Assuming image field exists
        };
        return acc;
      }, {});

      // Filter geofences assigned to employees under this manager and merge data
      const combinedData = allGeofences
        .filter(geofence => employeeMap[geofence.employee_id]) // Ensure geofence belongs to one of the manager's employees
        .map(geofence => {
          const employee = employeeMap[geofence.employee_id];
          return {
            ...geofence,
            employee_name: employee.name,
            employee_phone: employee.phone,
            employee_image: employee.image,
            // Ensure necessary fields for status check exist and are valid
            start_date: geofence.start_date,
            end_date: geofence.end_date,
            is_active: geofence.is_active !== undefined ? geofence.is_active : true // Default to true if undefined? Or handle based on API spec
          };
        });

      setAssignedGeofences(combinedData);
      // Apply filtering immediately after fetching
      applyFilters(searchQuery, activeFilter, combinedData);

    } catch (error) {
      console.error('Error fetching assigned geofences:', error);
      Alert.alert('Error', 'Failed to load assigned geofences. Please try again.');
      setAssignedGeofences([]);
      setFilteredGeofences([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // No dependencies needed for useCallback if managerId is static or comes from props/context


    // --- Filtering Logic ---
    const applyFilters = (currentSearchQuery, currentActiveFilter, sourceData) => {
        let results = [...sourceData];
        const now = new Date();

        // Apply search query filter
        if (currentSearchQuery.trim()) {
            results = results.filter(item => {
                const employeeName = item?.employee_name?.toLowerCase() || '';
                const geofenceName = item?.geofence_name?.toLowerCase() || ''; // Make sure 'geofence_name' exists in your data
                return (
                    employeeName.includes(currentSearchQuery.toLowerCase()) ||
                    geofenceName.includes(currentSearchQuery.toLowerCase())
                );
            });
        }

        // Apply status filter
        if (currentActiveFilter !== 'all') {
            results = results.filter(item => {
                const status = getStatus(item.start_date, item.end_date, item.is_active);
                return status === currentActiveFilter;
            });
        }

        setFilteredGeofences(results);
    };

    // --- Effects ---
    // Initial fetch and fetch on screen focus
    useFocusEffect(
        useCallback(() => {
        fetchAssignedGeofences();
        // Optional: Reset search/filter when screen focuses
        // setSearchQuery('');
        // setActiveFilter('all');
        }, [fetchAssignedGeofences]) // Depend on the memoized fetch function
    );

    // Re-apply filters when search query, active filter, or base data changes
    useEffect(() => {
        applyFilters(searchQuery, activeFilter, assignedGeofences);
    }, [searchQuery, activeFilter, assignedGeofences]);

    // --- Event Handlers ---
    const onRefresh = () => {
        setRefreshing(true);
        fetchAssignedGeofences(true); // Pass true to indicate it's a refresh
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
    };


  // --- Rendering ---
  const renderGeofenceItem = ({ item }) => (
    <Pressable // Changed from TouchableOpacity
      style={styles.card} // Updated style name
      onPress={() =>
        navigation.navigate('AssignedGeofenceDetails', { // Ensure this screen exists
          geofence: item,
          // Pass only necessary employee details if needed on the next screen
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
        <Text style={styles.value}>{item.employee_name || 'N/A'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Geofence:</Text>
        <Text style={styles.value}>{item.geofence_name || 'N/A'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Status:</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.start_date, item.end_date, item.is_active) }
        ]}>
          <Text style={styles.statusText}>
            {getStatus(item.start_date, item.end_date, item.is_active).toUpperCase()}
          </Text>
        </View>
      </View>
      {/* Add more details if needed, e.g., dates */}
        <View style={styles.cardRow}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>
            {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A'} - {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A'}
            </Text>
        </View>
    </Pressable>
  );

    // --- Loading State ---
    if (loading && !refreshing) { // Show full screen loader only on initial load
        return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="rgb(73, 143, 235)" />
            <Text style={styles.loadingText}>Loading Geofences...</Text>
        </View>
        );
    }


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>Assigned Geofences</Text>
      </View>

      {/* Search and Filter Section */}
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search Employee or Geofence"
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ fontSize: 14 }} // Optional: Adjust font size
          iconColor='rgb(73, 143, 235)' // Match theme color
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          {['all', 'active', 'upcoming', 'expired', 'inactive'].map(filter => ( // Added 'inactive' filter
            <Chip
              key={filter}
              selected={activeFilter === filter}
              onPress={() => handleFilterChange(filter)}
              style={[
                styles.chip,
                { backgroundColor: activeFilter === filter ? 'rgb(73, 143, 235)' : '#e0e0e0' }
              ]}
              textStyle={{
                color: activeFilter === filter ? '#fff' : '#333',
                fontWeight: activeFilter === filter ? 'bold' : 'normal'
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* List Section */}
      {filteredGeofences.length > 0 ? (
        <FlatList
          data={filteredGeofences}
          // Use a more stable key if available from API (e.g., assignment_id)
          keyExtractor={(item, index) => `${item.employee_id}-${item.geo_id}-${item.start_date}-${index}`}
          renderItem={renderGeofenceItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['rgb(73, 143, 235)']} // Spinner color
            />
          }
          contentContainerStyle={styles.listContentContainer} // Added padding
          removeClippedSubviews={false}
        />
      ) : (
         !loading && ( // Only show empty message if not loading
          <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
              {assignedGeofences.length === 0
                  ? "No geofences assigned yet." // Message when there's absolutely no data
                  : "No geofences match your current filters." // Message when filters result in empty list
              }
              </Text>
          </View>
          )
      )}
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC', // Match EmployeeList background
    // Removed main padding, applying it to specific content areas if needed
  },
  // Header Styles (Matching EmployeeList)
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
    fontWeight: 'bold', // Match EmployeeList
    color: '#fff',
    // Removed marginLeft, alignment handled by flexbox
  },
  // Filter Container Styles
  filterContainer: {
    paddingHorizontal: 15, // Main horizontal padding
    paddingVertical: 10, // Vertical padding
    marginVertical: 10, // Space below header/above list
    // Removed background color, inherits from container
  },
  searchBar: {
    backgroundColor: '#fff', // White background
    borderRadius: 10, // Match border radius
    marginBottom: 15, // Space below search bar
    elevation: 2, // Subtle shadow
    height: 48, // Standard height
  },
  chipContainer: {
    paddingVertical: 5, // Padding for the scroll view content
  },
  chip: {
    marginRight: 8,
    height: 36, // Slightly taller chips
    justifyContent: 'center',
    paddingHorizontal: 8, // Internal padding
  },
  // List Styles
  listContentContainer: {
    paddingHorizontal: 15, // Horizontal padding for list items
    paddingBottom: 20, // Space at the bottom
  },
  // Card Styles (Matching EmployeeList Item)
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10, // Space between cards
    elevation: 3, // Shadow matching EmployeeList
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically in the row
    marginBottom: 8, // Space between rows in a card
  },
  label: {
    fontWeight: 'bold', // Make labels stand out
    fontSize: 14,
    color: '#333',
    marginRight: 5, // Space after label
    minWidth: 70, // Ensure labels align somewhat
  },
  value: {
    flex: 1, // Take remaining space
    fontSize: 14,
    color: '#555',
  },
  statusBadge: {
    paddingHorizontal: 10, // Badge padding
    paddingVertical: 4,
    borderRadius: 12, // Pill shape
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 11, // Smaller font for badge
    fontWeight: 'bold',
    textTransform: 'uppercase', // Match design
  },
  // Loading and Empty State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FC', // Match background
  },
   loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyContainer: {
    flex: 1, // Take up remaining space if list is empty
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AssignedGeofenceListScreen;