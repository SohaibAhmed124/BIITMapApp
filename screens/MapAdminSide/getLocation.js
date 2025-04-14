import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal, Image, TouchableOpacity, TextInput, FlatList } from 'react-native';
import WebView from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import mapLocationApi from '../Api/MapLocationApi';

const GetLocationScreen = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [mapRef, setMapRef] = useState(null)

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await mapLocationApi.getAllLocations();
      setLocations(data);
    } catch (err) {
      setError('Failed to fetch locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      setFilteredLocations(locations.filter(loc => loc.name.toLowerCase().includes(query.toLowerCase())));
    } else {
      setFilteredLocations([]);
    }
  };

  const handleLocationSelect = (location) => {
    setSearchQuery(location.name);
    setFilteredLocations([]);
    mapRef.injectJavaScript(`map.setView([${location.latitude}, ${location.longitude}], 18);`);
  };

  const generateMapHtml = () => {
    return `
      <html>
        <head>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; }
    </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map').setView([33.6844, 73.0479], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            var markers = [];

            function createMarker(lat, lng, name, description, imageUrl) {
              var marker = L.marker([lat, lng]).addTo(map);
              marker.on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ name, description, image_url: imageUrl }));
              });
              markers.push({ marker, lat, lng });
            }

            ${locations.map(loc => `createMarker(${loc.latitude}, ${loc.longitude}, "${loc.name}", "${loc.description}", "${loc.image_url}");`).join('\n')}
          </script>
        </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Map Locations</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search location..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.id.toString()}
            style={styles.suggestionsList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem} onPress={() => handleLocationSelect(item)}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <WebView
          ref={setMapRef}
          originWhitelist={['*']}
          source={{ html: generateMapHtml() }}
          onMessage={(event) => {
            const locationData = JSON.parse(event.nativeEvent.data);
            setSelectedLocation(locationData);
            setModalVisible(true);
          }}
          style={{ flex: 1 }}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            {selectedLocation && (
              <>
                <Text style={styles.title}>{selectedLocation.name}</Text>
                <Text>{selectedLocation.description}</Text>
                {selectedLocation.image_url && (
                  <Image source={{ uri: selectedLocation.image_url }} style={styles.image} />
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "rgb(199, 217, 228)", padding:10},
  header: { backgroundColor: "rgb(73, 143, 235)", width: 'auto', height: 50, flexDirection: 'row', borderRadius: 20, marginBottom: 10 },
  headerText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 10, color: "rgb(255,255,255)" },
  searchContainer: { position: 'absolute', top: 95, left: 60, right: 10, zIndex: 10 },
  searchBar: { backgroundColor: '#fff', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ccc', width: '85%' },
  suggestionsList: { backgroundColor: '#fff', borderRadius: 5, maxHeight: 150, position: 'absolute', top: 45, left: 0, right: 0, zIndex: 10 },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 10, right: 10, padding: 5 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  image: { width: 200, height: 200, marginVertical: 10, borderRadius: 10 },
});

export default GetLocationScreen;
