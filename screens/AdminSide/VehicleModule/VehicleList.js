import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AdminService from '../AdminApiService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const VehicleList = () => {
  const navigation = useNavigation();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchVehicles();
    }, [])
  );

  const fetchVehicles = async () => {
    try {
      const response = await AdminService.getAllVehicles();
      setVehicles(response.vehicles);
      setFilteredVehicles(response.vehicles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error.message);
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredVehicles(vehicles);
    } else {
      const filtered = vehicles.filter((vehicle) =>
        vehicle.model.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredVehicles(filtered);
    }
  };

  const handleEdit = (id, vehicle) => {
    navigation.navigate('UpdateVehicle', { vehicleId: id, data: vehicle });
  };

  const handleDelete = (id) => {
    setShowPopup(true);
    setSelectedVehicle(id);
  };

  const confirmDelete = async () => {
    setShowPopup(false);
    if (selectedVehicle) {
      try {
        await AdminService.deactivateVehicle(selectedVehicle);
        setVehicles((prev) => prev.filter((veh) => veh.vehicle_id !== selectedVehicle));
        setFilteredVehicles((prev) => prev.filter((veh) => veh.vehicle_id !== selectedVehicle));
        console.log('Vehicle deleted successfully');
      } catch (error) {
        console.error('Error deleting vehicle:', error.message);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading Vehicles...</Text>
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
              <Text style={styles.headerText}>Vehicles</Text>
            </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.vehicle_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.vehicleItem}>
            <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('VehicleDetail', { data: item })}>
              <Text style={styles.vehicleName}>{item.model}</Text>
            </Pressable>
            <Pressable onPress={() => handleEdit(item.vehicle_id, item)}>
              <Icon name="pencil" size={24} color="#2E86C1" style={styles.icon} />
            </Pressable>
            <Pressable onPress={() => handleDelete(item.vehicle_id)}>
              <Icon name="trash" size={24} color="#D32F2F" style={styles.icon} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noVehiclesText}>No vehicles found.</Text>
        }
        removeClippedSubviews={false}
      />

      <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddVehicle')}>
        <Icon name="add" size={30} color="#fff" />
        <Text style={styles.addButtonText}>Add Vehicle</Text>
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
            <Text style={styles.popupText}>Do you want to delete this vehicle?</Text>
            <View style={styles.popupButtons}>
              <Pressable style={[styles.popupButton, styles.confirmButton]} onPress={confirmDelete}>
                <Text style={styles.popupButtonText}>Yes</Text>
              </Pressable>
              <Pressable style={[styles.popupButton, styles.cancelButton]} onPress={() => setShowPopup(false)}>
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
      backgroundColor: '#fff',
    },
    header: {
      backgroundColor: '#007BFF',
      padding: 20,
      paddingTop: 50,
      alignItems: 'center',
    },
    headerText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 10,
      padding: 10,
      backgroundColor: '#F5F5F5',
      borderRadius: 10,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
    },
    vehicleItem: {
      flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    },
    avatar: {
      backgroundColor: '#D8BFD8',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    avatarText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    vehicleName: {
      fontSize: 16,
    flex: 1,
    },
    icon: {
      marginHorizontal: 10,
    },
    addButton: {
      flexDirection: 'row',
      backgroundColor: '#007BFF',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 15,
      margin: 20,
      borderRadius: 30,
    },
    addButtonText: {
      color: '#fff',
      marginLeft: 10,
      fontSize: 16,
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noVehiclesText: {
      textAlign: 'center',
      marginTop: 20,
      color: '#888',
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
    },container: {
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
    employeeItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      elevation: 3,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#D8BFD8",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    avatarText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    employeeName: {
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
      margin: 20,
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
export default VehicleList