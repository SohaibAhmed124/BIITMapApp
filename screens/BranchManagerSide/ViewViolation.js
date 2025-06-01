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
  IconButton,
} from 'react-native-paper';
import { WebView } from 'react-native-webview';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "react-native-modal-datetime-picker";
import api from '../../Api/ManagerApi';
import GeofenceService from '../../Api/GeofenceApi';
import dayjs from 'dayjs';

const ViolationsScreen = ({ navigation, route }) => {
  const { managerId } = route.params;
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ViolationRes, geofenceRes] = await Promise.all([
        api.getManagerViolations(managerId),
        GeofenceService.getAllGeofences(),
      ]);

      const geofenceMap = Array.isArray(geofenceRes)
        ? geofenceRes.reduce((acc, gf) => {
          acc[gf.geo_id] = gf;
          return acc;
        }, {})
        : {};

      const data = Array.isArray(ViolationRes.violation)
        ? ViolationRes.violation.map(v => {
          const matchedGeofence = geofenceMap[v.geo_id];
          return {
            ...v,
            geo_boundary: matchedGeofence?.boundary || null,
          };
        })
        : [];
      setViolations(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load violations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDatePicked = (date) => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const filteredViolations = violations.filter(violation => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      violation.first_name.toLowerCase().includes(searchLower) ||
      violation.last_name.toLowerCase().includes(searchLower) ||
      violation.violation_type.toLowerCase().includes(searchLower);

    const matchesDate = selectedDate
      ? dayjs(violation.violation_time).isSame(selectedDate, 'day')
      : true;

    return matchesSearch && matchesDate;
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
  const generateMapHtml = (boundary) => {
    if (!boundary || boundary.length === 0) return '';

    const coordinates = boundary.map(point => [point.latitude, point.longitude]);
    // Optional: close the polygon
    coordinates.push([boundary[0].latitude, boundary[0].longitude]);

    const polygonCoords = JSON.stringify(coordinates);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        #map { height: 200px; width: 100%; border-radius: 8px; }
        html, body { margin: 0; padding: 0; }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map',{zoomControl:false}).setView(${JSON.stringify(coordinates[0])}, 17);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        var polygon = L.polygon(${polygonCoords}, {
          color: 'blue',
          fillOpacity: 0.4
        }).addTo(map);

        map.fitBounds(polygon.getBounds());
      </script>
    </body>
    </html>
  `;
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

            {item.geo_boundary?.length > 0 && (
              <View style={styles.mapContainer}>
                <WebView
                  originWhitelist={['*']}
                  source={{ html: generateMapHtml(item.geo_boundary) }}
                  style={styles.mapWebView}
                  scrollEnabled={false}
                />
              </View>
            )}
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

      {/* Searchbar with calendar icon */}
      <View>
        <Searchbar
          placeholder="Search by name or type..."
          onChangeText={setSearchTerm}
          value={searchTerm}
          style={styles.searchbar}
          right={() => (
            <IconButton
              icon="calendar"
              size={24}
              onPress={() => setDatePickerVisibility(true)}
            />
          )}
        />

        {/* Show selected date as a chip below the searchbar */}
        {selectedDate && (
          <View style={styles.dateChipContainer}>
            <Chip
              icon="calendar"
              onClose={clearDateFilter}
              closeIcon="close"
              mode="outlined"
              style={styles.dateChip}
            >
              {dayjs(selectedDate).format('MMM D, YYYY')}
            </Chip>
          </View>
        )}
      </View>

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
              {searchTerm || selectedDate
                ? 'No matching violations found'
                : 'No violations recorded'}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        removeClippedSubviews={false}
      />

      <DateTimePicker
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDatePicked}
        onCancel={() => setDatePickerVisibility(false)}
      />
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
  mapContainer: {
    height: 200,
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapWebView: {
    flex: 1,
    borderRadius: 8,
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
  searchbar: {
    marginTop: 15,
    marginBottom: 6,
    borderRadius: 8,
  },
  dateChipContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 8,
  },
  dateChip: {
    height: 32,
    justifyContent: 'center',
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
  buttonContent: {
    height: 46,
  },
  separator: {
    height: 8,
  },
});

export default ViolationsScreen;
