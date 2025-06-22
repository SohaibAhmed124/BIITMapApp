import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { BASE_URL, MAP_URL } from '../../Api/BaseConfig';
import axios from 'axios';

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

const LayerCreation = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'ptcl',
    hasThreat: false,
    threatLevel: 'low'
  });
  
  const webViewRef = useRef(null);

  // Generate HTML for WebView with Leaflet
  const generateLeafletHTML = (MAP_URL) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Leaflet Map</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
          #map {
            width: 100%;
            height: 100%;
          }
          .leaflet-touch .leaflet-control-layers, 
          .leaflet-touch .leaflet-bar {
            border: none;
            box-shadow: 0 1px 5px rgba(0,0,0,0.4);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
        <script>
          // Initialize the map
          const map = L.map('map').setView([33.6844, 73.0479], 13);
          
          // Add tile layer
          L.tileLayer('${MAP_URL}').addTo(map);
          
          // Feature group to store drawn items
          const drawnItems = new L.FeatureGroup();
          map.addLayer(drawnItems);
          
          // Initialize the draw control
          const drawControl = new L.Control.Draw({
            draw: {
              polyline: true,
              polygon: false,
              rectangle: false,
              circle: false,
              marker: false,
              circlemarker: false,
            },
            edit: {
              featureGroup: drawnItems
            }
          });
          map.addControl(drawControl);
          
          // Handle drawing events
          map.on(L.Draw.Event.CREATED, function(e) {
            const layer = e.layer;
            drawnItems.addLayer(layer);
            
            // Extract coordinates and send to React Native
            const coords = layer.getLatLngs().map(point => ({
              latitude: point.lat,
              longitude: point.lng
            }));
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'POLYLINE_CREATED',
              coordinates: coords
            }));
          });
          
          // Make map fill the container
          setTimeout(() => map.invalidateSize(), 100);
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'POLYLINE_CREATED') {
        setCoordinates(data.coordinates);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

//   const handleSubmit = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       if (!formData.name.trim()) {
//         throw new Error('Line name is required');
//       }

//       const payload = {
//         ...formData,
//         geometry: coordinates.map(coord => [coord.longitude, coord.latitude])
//       };

//       const response = await axios.post(
//         `${BASE_URL}/api/location/map-lines`, 
//         payload,
//         {
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (!response.data.success) {
//         throw new Error(response.data.error || 'Failed to save line');
//       }

//       // Reset form and close modal
//       setFormData({
//         name: '',
//         description: '',
//         category: 'ptcl',
//         hasThreat: false,
//         threatLevel: 'low'
//       });
//       setCoordinates([]);
//       setModalVisible(false);
      
//       // Clear the drawn items on the map
//       webViewRef.current.injectJavaScript(`
//         drawnItems.clearLayers();
//         true; // note: this is required for Android
//       `);
//     } catch (err) {
//       console.error('Submission error:', err);
//       setError(err.response?.data?.error || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

  const handleSubmit = async () => {
  setLoading(true);
  setError(null);

  try {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Line name is required');
      throw new Error('Line name is required');
    }

    const payload = {
      ...formData,
      geometry: coordinates.map(coord => [coord.longitude, coord.latitude])
    };

    const response = await axios.post(
      `${BASE_URL}/api/location/map-lines`, 
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.data.success) {
      Alert.alert('Error', response.data.error || 'Failed to save line');
      throw new Error(response.data.error || 'Failed to save line');
    }

    // Show success alert
    Alert.alert(
      'Success', 
      'Line saved successfully!',
      [
        { 
          text: 'OK', 
          onPress: () => {
            // Reset form and close modal
            setFormData({
              name: '',
              description: '',
              category: 'ptcl',
              hasThreat: false,
              threatLevel: 'low'
            });
            setCoordinates([]);
            setModalVisible(false);
            
            // Clear the drawn items on the map
            webViewRef.current.injectJavaScript(`
              drawnItems.clearLayers();
              true;
            `);
          }
        }
      ]
    );

  } catch (err) {
    console.error('Submission error:', err);
    const errorMessage = err.response?.data?.error || err.message;
    setError(errorMessage);
    
    // Only show alert if not already shown for validation/response error
    if (!err.response?.data?.error && err.message !== 'Line name is required') {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Layer Creation</Text>
        <Text style={styles.headerSubtitle}>Draw polylines on the map and add details</Text>
      </View>

      {/* WebView with Leaflet Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: generateLeafletHTML(MAP_URL) }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleWebViewMessage}
          startInLoadingState={true}
          mixedContentMode="always"
          setSupportMultipleWindows={false}
        />
      </View>

      {/* Save Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Polyline</Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <ScrollView contentContainerStyle={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Line Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Enter line name"
                  placeholderTextColor={colors.gray}
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => handleInputChange('description', text)}
                  placeholder="Enter description"
                  placeholderTextColor={colors.gray}
                  multiline
                  numberOfLines={3}
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.selectContainer}>
                  {['ptcl', 'railway', 'highways', 'threat'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.selectOption,
                        formData.category === item && styles.selectedOption
                      ]}
                      onPress={() => handleInputChange('category', item)}
                      disabled={loading}
                    >
                      <Text style={styles.selectOptionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.formGroup, styles.checkboxGroup]}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => handleInputChange('hasThreat', !formData.hasThreat)}
                  disabled={loading}
                >
                  <View style={[
                    styles.checkbox,
                    formData.hasThreat && styles.checkboxChecked
                  ]}>
                    {formData.hasThreat && <Text style={styles.checkboxIcon}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Has Threat?</Text>
                </TouchableOpacity>
              </View>

              {formData.hasThreat && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Threat Level *</Text>
                  <View style={styles.selectContainer}>
                    {['low', 'medium', 'high', 'critical'].map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.selectOption,
                          formData.threatLevel === item && styles.selectedOption
                        ]}
                        onPress={() => handleInputChange('threatLevel', item)}
                        disabled={loading}
                      >
                        <Text style={styles.selectOptionText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
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
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: colors.danger + '20',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  formContainer: {
    paddingBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: colors.darkGray,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxIcon: {
    color: colors.white,
    fontSize: 12,
  },
  checkboxLabel: {
    color: colors.darkGray,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 4,
  },
  selectedOption: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  selectOptionText: {
    color: colors.darkGray,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '500',
  },
});

export default LayerCreation;