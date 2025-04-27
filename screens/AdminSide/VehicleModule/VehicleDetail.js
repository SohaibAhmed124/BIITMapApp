import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable
} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import { API_BASE_URL } from '../../Api/BaseConfig';

const VehicleDetail = ({ navigation, route }) => {
  const { data } = route.params; // Retrieve vehicleId from params
  const [vehicle, setVehicle] = useState(data);


  if (!vehicle) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load vehicle details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>Vehicle Details</Text>
      </View>
      <View style={styles.content}>
        {console.log(vehicle)}
        
        <Text style={styles.vehicleModel}>{vehicle.model}</Text>
        <Image
          source={{  uri: vehicle.image
                        ? `${API_BASE_URL}${vehicle.image}` 
                        : 'https://via.placeholder.com/150' 
                  }} // Placeholder if image is unavailable
          style={{height:150, width:250}}
        />
        <Text style={styles.vehicleDetail}>
          <Text style={styles.label}>Year: </Text>
          {vehicle.year || 'N/A'}
        </Text>
      </View>
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
    backgroundColor: "#2E86C1",
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
  content: {
    alignItems: 'center',
    padding: 20,
  },
  vehicleModel: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2E86C1',
  },
  vehicleDetail: {
    fontSize: 16,
    color: '#555',
  },
  label: {
    fontWeight: 'bold',
    color: '#2E86C1',
  },
});
export default VehicleDetail;
