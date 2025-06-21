import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import WebView from 'react-native-webview';
import { launchImageLibrary } from 'react-native-image-picker';
import mapLocationApi from '../../Api/MapLocationApi';
import Icon from 'react-native-vector-icons/Ionicons';
import { MAP_URL } from '../../Api/BaseConfig';
import { SelectList } from 'react-native-dropdown-select-list';

// Color scheme
const colors = {
  primary: 'rgb(73, 143, 235)',
  primaryLight: 'rgba(73, 143, 235, 0.2)',
  primaryDark: 'rgb(50, 120, 210)',
  secondary: 'rgb(235, 179, 73)',
  background: 'rgb(245, 247, 250)',
  white: '#ffffff',
  lightGray: 'rgb(230, 230, 230)',
  gray: 'rgb(180, 180, 180)',
  darkGray: 'rgb(100, 100, 100)',
  success: 'rgb(76, 175, 80)',
  danger: 'rgb(244, 67, 54)',
  warning: 'rgb(255, 193, 7)',
};

const generateHTML = (MAP_URL) => `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          body, html { margin: 0; padding: 0; height: 100%; }
          #map { height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([33.6844, 73.0479], 13);
          L.tileLayer('${MAP_URL}').addTo(map);
          
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

const AddLocationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [type, setType] = useState('');
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isFormModalVisible, setFormModalVisible] = useState(false);
  const [marker, setMarker] = useState(null);

  const typeOptions = [
    { key: 'hospital', value: 'Hospital' },
    { key: 'ptcl', value: 'PTCL Offices' },
    { key: 'toll', value: 'Toll Plazas' },
    { key: 'police', value: 'Police Stations' },
    { key: 'school', value: 'Schools/Universities' },
    { key: 'restaurant', value: 'Restaurant' },
    { key: 'atm', value: 'ATMs/Banks' },
    { key: 'fuel', value: 'Fuel Stations' },
    { key: 'park', value: 'Park' },
  ];

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
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

  // const handleAddLocation = async () => {
  //   if (!latitude || !longitude) {
  //     Alert.alert('Error', 'Please select a location on the map');
  //     return;
  //   }

  //   if (!type) {
  //     Alert.alert('Error', 'Please select a location type');
  //     return;
  //   }

  //   if (!name) {
  //     Alert.alert('Error', 'Please enter a location name');
  //     return;
  //   }

  //   try {
  //     const response = await mapLocationApi.addLocation({
  //       name, 
  //       longitude, 
  //       latitude, 
  //       description,
  //       type,
  //       image_url: imageUri
  //     });

  //     Alert.alert('Success', response.message || 'Location added successfully');
  //     setName('');
  //     setDescription('');
  //     setImageUri(null);
  //     setType('');
  //     setMarker(null);
  //     setFormModalVisible(false);
  //   } catch (error) {
  //     console.log('API Error:', error.response ? error.response.data : error.message);
  //     Alert.alert('Error', error.response?.data?.message || 'Failed to add location');
  //   }
  // };
  const handleAddLocation = async () => {
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    if (!type) {
      Alert.alert('Error', 'Please select a location type');
      return;
    }

    if (!name) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    try {
      // Create FormData object
      const formData = new FormData();

      // Append all fields to FormData
      formData.append('name', name);
      formData.append('longitude', longitude.toString());
      formData.append('latitude', latitude.toString());
      formData.append('description', description);
      formData.append('type', type);

      // If image is selected, append it to FormData
      if (image) {
        const imageFile = {
          uri: image.uri,
          type: image.type || 'image/jpeg',// or get the actual mime type from the image picker response
          name: image.fileName || 'location_image.jpg' // or get the actual filename
        };
        formData.append('image', imageFile);
      }

      console.log('Sending FormData:', formData);

      const response = await mapLocationApi.addLocation(formData);

      Alert.alert('Success', response.message || 'Location added successfully');
      setName('');
      setDescription('');
      setImage(null);
      setType('');
      setMarker(null);
      setFormModalVisible(false);
    } catch (error) {
      console.log('API Error:', error.response ? error.response.data : error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add location');
    }
  };
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Add New Location</Text>
      </View>

      <View style={styles.mapContainer}>
        <Text style={styles.instructionText}>Tap on the map to select location</Text>
        <WebView
          source={{ html: generateHTML(MAP_URL) }}
          onMessage={handleMapPress}
          style={styles.map}
          originWhitelist={["*"]}
        />
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={isConfirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={[styles.modalBackground, styles.centeredModal]}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Icon name="location" size={24} color={colors.primary} />
              <Text style={styles.modalTitle}>Confirm Location</Text>
            </View>
            <Text style={styles.modalText}>You've selected this location:</Text>
            <Text style={styles.coordinatesText}>Latitude: {latitude?.toFixed(6)}</Text>
            <Text style={styles.coordinatesText}>Longitude: {longitude?.toFixed(6)}</Text>
            <Text style={styles.modalText}>Do you want to proceed?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleConfirmNo}>
                <Text style={styles.modalButtonText}>No, Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleConfirmYes}>
                <Text style={styles.modalButtonText}>Yes, Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Form Modal */}
      <Modal
        visible={isFormModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFormModalVisible(false)}
      >
        <View style={[styles.modalBackground, styles.centeredModal]}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Icon name="pencil" size={24} color={colors.primary} />
                <Text style={styles.formTitle}>Location Details</Text>
              </View>

              <Text style={styles.label}>Location Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter location name"
                placeholderTextColor={colors.gray}
              />

              <Text style={styles.label}>Location Type *</Text>
              <SelectList
                setSelected={(val) => setType(val)}
                data={typeOptions}
                save="key"
                placeholder="Select location type"
                search={false}
                boxStyles={styles.dropdownBox}
                inputStyles={styles.dropdownInput}
                dropdownStyles={styles.dropdownList}
                dropdownItemStyles={styles.dropdownItem}
                dropdownTextStyles={styles.dropdownText}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description (optional)"
                placeholderTextColor={colors.gray}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Location Image</Text>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Icon name="image" size={20} color={colors.white} />
                <Text style={styles.imageButtonText}>Select Image</Text>
              </TouchableOpacity>

              {image && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImage(null)}
                  >
                    <Icon name="close" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.submitButton} onPress={handleAddLocation}>
                <Text style={styles.submitButtonText}>Save Location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelFormButton}
                onPress={() => setFormModalVisible(false)}
              >
                <Text style={styles.cancelFormButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    borderRadius: 10
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  mapContainer: {
    flex: 1,
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  instructionText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: colors.white,
    padding: 10,
    textAlign: 'center',
    fontSize: 14,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  map: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  centeredModal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: colors.darkGray,
  },
  modalText: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 10,
    textAlign: 'center',
  },
  coordinatesText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: colors.danger
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    padding: 25,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 5,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    color: colors.darkGray,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {

    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.darkGray,
    backgroundColor: colors.white,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdownBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  dropdownInput: {
    fontSize: 16,
    color: colors.darkGray,
  },
  dropdownList: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginTop: 5,
    borderRadius: 8,
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 0,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.darkGray,
  },
  imageButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.danger,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelFormButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cancelFormButtonText: {
    color: colors.darkGray,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddLocationScreen;