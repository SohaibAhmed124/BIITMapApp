import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import {
  Text,
  Searchbar,
  ActivityIndicator,
  Button,
  Card,
  Divider,
  useTheme,
} from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import layerApi from '../../Api/LayerApi';
import dayjs from 'dayjs';
import { ICON_IMG_URL } from '../../Api/BaseConfig';

const AssignedLayersScreen = ({ navigation }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await layerApi.getAllUserLayerAssignments();
      setAssignments(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      assignment.username.toLowerCase().includes(searchLower) ||
      (assignment.layer_name && assignment.layer_name.toLowerCase().includes(searchLower))
    );
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getLayerIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'location':
        return 'map-marker';
      case 'line':
        return 'vector-line';
      case 'threat':
        return 'alert';
      default:
        return 'layers';
    }
  };

  const renderItem = ({ item }) => (
    <Card
      style={styles.itemCard}
      onPress={() => toggleExpand(item.id)}
    >
      <Card.Content>
        <View style={styles.itemHeader}>
          <Icon 
            name={getLayerIcon(item.layer_category)} 
            size={24} 
            color={theme.colors.primary} 
            style={styles.layerIcon}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.username} numberOfLines={1}>
              {item.username}
            </Text>
            <Text style={styles.layerName} numberOfLines={1}>
              {item.layer_name || 'Unnamed Layer'}
            </Text>
          </View>
          <Icon 
            name={expandedId === item.id ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color={theme.colors.text} 
          />
        </View>

        {expandedId === item.id && (
          <View style={styles.detailsContainer}>
            <Divider style={styles.detailsDivider} />
            
            {/* Layer Image */}
            {item.image && (
              <Image 
                source={{ uri: `${ICON_IMG_URL}/${item.image}` }} 
                style={styles.layerImage}
                resizeMode="contain"
              />
            )}

            {/* Details with icons */}
            <View style={styles.detailRow}>
              <Icon name="calendar" size={20} color={theme.colors.text} />
              <Text style={styles.detailText}>
                Assigned: {dayjs(item.assigned_at).format('MMM D, YYYY')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="clock" size={20} color={theme.colors.text} />
              <Text style={styles.detailText}>
                {item.start_time ? dayjs(item.start_time).format('h:mm A') : 'No start time'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="clock-end" size={20} color={theme.colors.text} />
              <Text style={styles.detailText}>
                {item.end_time ? dayjs(item.end_time).format('h:mm A') : 'No end time'}
              </Text>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading && assignments.length === 0) {
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
        <Button mode="contained" onPress={fetchAssignments} style={styles.retryButton}>
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
        <Text style={styles.headerText}>Assigned Layers</Text>
      </View>

      <Searchbar
        placeholder="Search by username or layer..."
        onChangeText={setSearchTerm}
        value={searchTerm}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredAssignments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAssignments}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Text variant="bodyMedium">
              {searchTerm
                ? 'No matching assignments found'
                : 'No layers assigned yet'}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        removeClippedSubviews={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgb(73, 143, 235)",
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
  searchbar: {
    margin: 10,
    borderRadius: 8,
  },
  itemCard: {
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  layerIcon: {
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
  },
  layerName: {
    color: '#666',
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailsDivider: {
    marginVertical: 8,
    height: 1,
  },
  layerImage: {
    height: 150,
    width: '100%',
    borderRadius: 4,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  detailText: {
    marginLeft: 10,
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  separator: {
    height: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default AssignedLayersScreen;