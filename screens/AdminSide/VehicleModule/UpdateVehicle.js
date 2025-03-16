import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import AdminService from '../AdminApiService';

const UpdateVehicle = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { vehicleId, data } = route.params;

  const [model, setModel] = useState(data.model);
  const [year, setYear] = useState(data.year);
  const [image, setImage] = useState(data.image);
  const [updateImg, setUpdateImage] = useState(null);


  const handleImagePicker = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error:', response.errorMessage);
      } else {
        setUpdateImage(response.assets[0]);
        setImage(response.assets[0].uri);
      }
    });
  };

  const handleUpdate = async () => {
    const updatedVehicle = {
      vehicle_id: vehicleId,
      model,
      year,
    };

    try {
      const response = await AdminService.updateVehicle(vehicleId, updatedVehicle);
      Alert.alert('Success', response.message || 'Vehicle updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Update Vehicle</Text>
      </View>
      <View style={styles.formContainer}>
        <Pressable onPress={handleImagePicker} style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Select Image</Text>
          )}
        </Pressable>
        <TextInput
          style={styles.input}
          value={model}
          onChangeText={setModel}
          placeholder="Model"
        />
        <TextInput
          style={styles.input}
          value={year}
          onChangeText={setYear}
          placeholder="Year"
        />
        <Pressable style={styles.submitButton} onPress={handleUpdate}>
          <Text style={styles.submitButtonText}>Update</Text>
        </Pressable>
      </View>
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
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 70,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#007BFF',
    alignSelf: 'center',
  },
  imagePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 50,
    height: 100,
    width: 100,
    marginBottom: 20,
    alignSelf: 'center',
  },
  imagePlaceholder: {
    color: '#888',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UpdateVehicle;
