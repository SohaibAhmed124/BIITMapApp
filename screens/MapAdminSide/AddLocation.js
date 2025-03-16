import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import WebView from 'react-native-webview';
import { launchImageLibrary } from 'react-native-image-picker';
import mapLocationApi from '../Api/MapLocationApi';

const AddLocationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isFormModalVisible, setFormModalVisible] = useState(false);
  const [marker, setMarker] = useState(null);

  const mapHtml = `
    <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      </head>
      <body>
        <div id="map" style="width: 100%; height: 100vh;"></div>
        <script>
          var map = L.map('map').setView([33.6844, 73.0479], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          
          var marker;
          map.on('click', function(e) {
            if (marker) {
              marker.setLatLng(e.latlng);
            } else {
              marker = L.marker(e.latlng).addTo(map);
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
          });
        </script>
      </body>
    </html>
  `;

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const handleMapPress = (event) => {
    const { lat, lng } = JSON.parse(event.nativeEvent.data);
    setLatitude(lat);
    setLongitude(lng);
    setMarker({ lat, lng });
    setConfirmModalVisible(true);
  };

  const handleConfirmYes = () => {
    setConfirmModalVisible(false);
    setFormModalVisible(true);
  };

  const handleConfirmNo = () => {
    setConfirmModalVisible(false);
    setMarker(null);
    setLatitude(null);
    setLongitude(null);
  };

  const handleAddLocation = async () => {
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    try {
      console.log('Sending data:', { name, longitude, latitude, description, image_url: imageUri });

      const response = await mapLocationApi.addLocation({
        name, longitude, latitude, description, image_url: imageUri
      });
      Alert.alert('Success', response.message || 'Location added successfully');


      setFormModalVisible(false);
      // navigation.goBack();
    } catch (error) {
      console.log('API Error:', error.response ? error.response.data : error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add location');
    }
  };



  return (
    <View style={styles.container}>
      <WebView source={{ html: mapHtml }} onMessage={handleMapPress} style={styles.map} />

      {/* Confirmation Modal */}
      <Modal visible={isConfirmModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Do you want to add a location here?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleConfirmYes}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleConfirmNo}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Form Modal */}
      <Modal visible={isFormModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.formContainer}>
            <Text style={styles.modalText}>Enter Location Details</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Location Name" placeholderTextColor="rgb(145, 140, 140)" />
            <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" multiline placeholderTextColor="rgb(145, 140, 140)" />
            <TouchableOpacity style={styles.transparentButton} onPress={pickImage}>
              <Text style={styles.buttonText}>Pick Image</Text>
            </TouchableOpacity>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
            <TouchableOpacity style={styles.transparentButton} onPress={handleAddLocation}>
              <Text style={styles.buttonText}>Add Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  formContainer: { width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  modalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalButtonContainer: { flexDirection: 'row', marginTop: 10 },
  modalButton: { flex: 1, padding: 10, backgroundColor: '#007bff', marginHorizontal: 5, borderRadius: 5, alignItems: 'center' },
  cancelButton: { backgroundColor: '#dc3545' },
  modalButtonText: { color: 'white', fontWeight: 'bold' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
  addButton: { width: '100%', padding: 10, backgroundColor: '#007bff', borderRadius: 5, alignItems: 'center' },
  imagePreview: { width: 100, height: 100, marginTop: 10 },
  transparentButton: { backgroundColor: 'rgba(0, 128, 0, 0.6)', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default AddLocationScreen;
