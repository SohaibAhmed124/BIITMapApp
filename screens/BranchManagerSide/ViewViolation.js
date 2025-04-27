import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import {
  Text,
  Searchbar,
  ActivityIndicator,
  Chip,
  Button,
  Card,
  Divider,
  useTheme,
} from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import api from '../Api/ManagerApi';
import dayjs from 'dayjs';

const ViolationsScreen = ({ navigation, route }) => {
  const { managerId } = route.params; // Replace with your actual manager ID
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      const response = await api.getManagerViolations(managerId);
      setViolations(response.violation || []);
    } catch (err) {
      console.error('Failed to fetch violations:', err);
      setError('Failed to load violations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredViolations = violations.filter(violation => {
    const searchLower = searchTerm.toLowerCase();
    return (
      violation.first_name.toLowerCase().includes(searchLower) ||
      violation.last_name.toLowerCase().includes(searchTerm) ||
      violation.violation_type.toLowerCase().includes(searchLower)
    );
  });

  const getViolationColor = (type) => {
    switch (type.toLowerCase()) {
      case 'exit':
        return theme.colors.error;
      case 'entry':
        return theme.colors.warning;
      default:
        return theme.colors.backdrop;
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }) => (
    <Card
      style={styles.itemCard}
      onPress={() => toggleExpand(item.ulocation_id)}
    >
      <Card.Content>
        <View style={styles.itemHeader}>
          <View style={styles.chipContainer}>
            <Chip
              style={[styles.chip, { backgroundColor: getViolationColor(item.violation_type) }]}
              textStyle={styles.chipText}
            >
              {item.violation_type}
            </Chip>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.employeeName}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={styles.timeText}>
              {dayjs(item.violation_time).format('MMM D, YYYY - h:mm A')}
            </Text>
          </View>
        </View>

        {expandedId === item.ulocation_id && (
          <View style={styles.detailsContainer}>
            <Divider style={styles.detailsDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Geofence:</Text>
              <Text style={styles.detailValue}>{item.geo_name}</Text>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading && violations.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Button mode="contained" onPress={fetchViolations} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Employee Violations</Text>
      </View>

      <Searchbar
        placeholder="Search by name or type..."
        onChangeText={setSearchTerm}
        value={searchTerm}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredViolations}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.ulocation_id}-${item.violation_time}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchViolations}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Text variant="bodyMedium">
              {searchTerm ? 'No matching violations found' : 'No violations recorded'}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        removeClippedSubviews={false}
      />

      <Button
        mode="contained"
        onPress={fetchViolations}
        icon="refresh"
        style={styles.refreshButton}
        contentStyle={styles.buttonContent}
      >
        Refresh Data
      </Button>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgb(73, 143, 235)",
    borderRadius: 10,
    paddingHorizontal: 10,
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
  card: {
    margin: 5,
    elevation: 3,
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 15,
    fontWeight: 'bold',
  },
  searchbar: {
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  listContent: {
    paddingBottom: 15,
  },
  itemCard: {
    marginHorizontal: 4,
    borderRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipContainer: {
    marginRight: 12,
  },
  chip: {
    height: 32,
    justifyContent: 'center',
  },
  chipText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  nameContainer: {
    flex: 1,
  },
  employeeName: {
    fontWeight: '600',
    fontSize: 16,
  },
  timeText: {
    color: '#666',
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailsDivider: {
    marginVertical: 8,
    height: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  detailValue: {
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
    width: '50%',
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: 'rgb(73, 143, 235)'
  },
  buttonContent: {
    height: 46,
  },
  separator: {
    height: 8,
  },
});

export default ViolationsScreen;