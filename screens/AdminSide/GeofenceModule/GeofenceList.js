import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import GeofenceService from "../GeofenceApi";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const GeofenceList = () => {
  const navigation = useNavigation();
  const [geofences, setGeofences] = useState([]);
  const [filteredGeofences, setFilteredGeofences] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedGeofence, setSelectedGeofence] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchGeofences();
    }, [])
  );

  const fetchGeofences = async () => {
    try {
      const response = await GeofenceService.getAllGeofences();
      setGeofences(response);
      setFilteredGeofences(response);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching geofences:", error.message);
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredGeofences(geofences);
    } else {
      const filtered = geofences.filter((geofence) =>
        geofence.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredGeofences(filtered);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
        <Text>Loading Geofences...</Text>
      </View>
    );
  }

  const handleDelete = (id) => {
    setShowPopup(true);
    setSelectedGeofence(id);
  };

  const confirmDelete = async () => {
    setShowPopup(false);
    if (selectedGeofence) {
      try {
        await GeofenceService.deactivateGeofence(selectedGeofence);
        setGeofences((prev) => prev.filter((g) => g.geo_id !== selectedGeofence));
        setFilteredGeofences((prev) => prev.filter((g) => g.geo_id !== selectedGeofence));
        console.log('Geofence deleted successfully');
      } catch (error) {
        console.error('Error deleting Geofence:', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>Geofences</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Geofence"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* Geofence List */}
      <FlatList
        data={filteredGeofences}
        keyExtractor={(item) => item.geo_id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.geofenceItem}
            onPress={() => navigation.navigate("GeofenceDetail", { geoData: item })}
          >
            <View style={styles.iconContainer}>
              <Icon name="location-outline" size={24} color="#2E86C1" />
            </View>
            <Text style={styles.geofenceName}>{item.name}</Text>
            <Icon name="trash" size={24} color="#D32F2F" style={styles.icon} onPress={() => {handleDelete(item.geo_id)}} />
          </Pressable>
        )}
        removeClippedSubviews={false}
      />

      {/* Add Button */}
      <Pressable style={styles.addButton} onPress={() => navigation.navigate("CreateGeofence") }>
        <Icon name="add" size={30} color="#fff" />
        <Text style={styles.addButtonText}>Add Geofence</Text>
      </Pressable>
      <Pressable style={styles.addButton} onPress={() => navigation.navigate("AllGeofences", { geofences })}>
        <Text style={styles.addButtonText}>Show All Geofence</Text>
      </Pressable>


      {/* Popup Modal */}
      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>Do you want to delete this Geofence?</Text>
            <View style={styles.popupButtons}>
              <Pressable
                style={[styles.popupButton, styles.confirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.popupButtonText}>Yes</Text>
              </Pressable>
              <Pressable
                style={[styles.popupButton, styles.cancelButton]}
                onPress={() => setShowPopup(false)}
              >
                <Text style={styles.popupButtonText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F7FC",
        padding: 15,
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
      searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        marginVertical: 15,
      },
      searchIcon: {
        marginRight: 10,
      },
      searchInput: {
        flex: 1,
      },
      geofenceItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
      },
      iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#D8BFD8",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
      },
      geofenceName: {
        fontSize: 16,
        flex: 1,
      },
      icon: {
        marginHorizontal: 10,
      },
      addButton: {
        flexDirection: "row",
        backgroundColor: "rgb(73, 143, 235)",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        margin: 10,
        borderRadius: 30,
      },
      addButtonText: {
        color: "#fff",
        marginLeft: 10,
        fontSize: 16,
        fontWeight: "bold",
      },
      loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
      popupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      popup: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
      },
      popupText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
      },
      popupButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      },
      popupButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 5,
        alignItems: 'center',
      },
      confirmButton: {
        backgroundColor: 'rgb(73, 143, 235)',
      },
      cancelButton: {
        backgroundColor: '#888',
      },
      popupButtonText: {
        color: '#fff',
        fontWeight: 'bold',
      },
});

export default GeofenceList;
