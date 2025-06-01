import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import GeofenceService from '../../../Api/GeofenceApi';

const CreateGeofenceScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [boundary, setBoundary] = useState([]);
  const [loading, setLoading] = useState(false);
  const webViewRef = useRef(null);

  const handleMapMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'boundary') {
        setBoundary(data.coordinates);
      }
    } catch (error) {
      console.error('Invalid message received:', error);
    }
  };

  const handleCreateGeofence = async () => {
    if (!name || boundary.length === 0) {
      Alert.alert('Error', 'Please provide a name and draw a boundary on the map.');
      return;
    }
    setLoading(true);
    try {
      await GeofenceService.createGeofence(name, boundary);
      Alert.alert('Success', 'Geofence created successfully!');
      setName('');
      setBoundary([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create geofence.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerText}>Create Geofence</Text>
      </View>

      {/* Input Field */}
      <TextInput
        placeholder="Enter Geofence Name"
        placeholderTextColor={'rgb(87, 87, 87)'}
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      {/* Map WebView */}
      <WebView
        ref={webViewRef}
        // source={require('../../../assets/map.html')}
        source={{ uri: 'file:///android_asset/map.html' }}
        onMessage={handleMapMessage}
        style={styles.mapContainer}
        javaScriptEnabled
        domStorageEnabled
      />

      {/* Buttons */}
      <Pressable style={styles.button} onPress={() => webViewRef.current?.injectJavaScript('window.resetBoundaryFromReactNative();')}>
        <Text style={styles.buttonText}>Reset Boundary</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.createButton]} onPress={handleCreateGeofence} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Create Geofence</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F4F7FC',
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
  input: {
    borderWidth: 1,
    borderColor: 'rgb(122, 120, 120)',
    borderRadius: 8,
    padding: 10,
    margin: 15,
    color: 'black',
    backgroundColor: 'white',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  button: {
    marginTop:10,
    backgroundColor: 'rgb(73, 143, 235)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  createButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateGeofenceScreen;
