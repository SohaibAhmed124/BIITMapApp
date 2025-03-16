// screens/AddLocationScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import mapLocationApi from '../api/mapLocationApi';

const AddLocationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [description, setDescription] = useState('');
  const [image_url, setImageUrl] = useState('');

  const mapHtml = `
    <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      </head>
      <body>
        <div id="map" style="width: 100%; height: 100vh;"></div>
        <script>
          var map = L.map('map').setView([30.3753, 69.3451], 5);
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

  const handleMapPress = (event) => {
    const { lat, lng } = JSON.parse(event.nativeEvent.data);
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleAddLocation = async () => {
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }
    try {
      await mapLocationApi.addLocation({ name, longitude, latitude, description, image_url });
      Alert.alert('Success', 'Location added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add location');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Location on Map:</Text>
      <View style={styles.mapContainer}>
        <WebView source={{ html: mapHtml }} onMessage={handleMapPress} />
      </View>
      <Text style={styles.label}>Name:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Description:</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} />
      <Text style={styles.label}>Image URL:</Text>
      <TextInput style={styles.input} value={image_url} onChangeText={setImageUrl} />
      <Button title="Add Location" onPress={handleAddLocation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  mapContainer: { height: 300, borderWidth: 1, marginBottom: 10 },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, padding: 8, marginTop: 5, borderRadius: 5 },
});

export default AddLocationScreen;
