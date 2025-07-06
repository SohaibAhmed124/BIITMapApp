// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   Alert, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Modal, 
//   Image, 
//   ScrollView,
//   ActivityIndicator
// } from 'react-native';
// import WebView from 'react-native-webview';
// import { launchImageLibrary } from 'react-native-image-picker';
// import LayerApi from '../../Api/LayerApi';
// import mapLocationApi from '../../Api/MapLocationApi';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { MAP_URL } from '../../Api/BaseConfig';
// import { SelectList } from 'react-native-dropdown-select-list';


// // Color scheme
// const colors = {
//   primary: 'rgb(73, 143, 235)',
//   primaryLight: 'rgba(73, 143, 235, 0.2)',
//   primaryDark: 'rgb(50, 120, 210)',
//   secondary: 'rgb(235, 179, 73)',
//   background: 'rgb(245, 247, 250)',
//   white: '#ffffff',
//   lightGray: 'rgb(230, 230, 230)',
//   gray: 'rgb(180, 180, 180)',
//   darkGray: 'rgb(100, 100, 100)',
//   success: 'rgb(76, 175, 80)',
//   danger: 'rgb(244, 67, 54)',
//   warning: 'rgb(255, 193, 7)',
// };

// const generateHTML = (MAP_URL) => `
//   <!DOCTYPE html>
//   <html>
//   <head>
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
//     <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
//     <style>
//       body, html { margin: 0; padding: 0; height: 100%; }
//       #map { height: 100%; }
//     </style>
//   </head>
//   <body>
//     <div id="map"></div>
//     <script>
//       var map = L.map('map').setView([33.6844, 73.0479], 13);
//       L.tileLayer('${MAP_URL}').addTo(map);
      
//       var marker;
//       map.on('click', function(e) {
//         if (marker) {
//           marker.setLatLng(e.latlng);
//         } else {
//           marker = L.marker(e.latlng).addTo(map);
//         }
//         window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
//       });
      
//       // Add zoom control
//       L.control.zoom({ position: "topright" }).addTo(map);
//     </script>
//   </body>
//   </html>
// `;

// const AddLocationScreen = ({ navigation }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     longitude: null,
//     latitude: null,
//     description: '',
//     type: '',
//     image: null
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
//   const [isFormModalVisible, setFormModalVisible] = useState(false);
//   const [locationTypes, setLocationTypes] = useState([]);

//   // Fetch location types on mount
//   useEffect(() => {
//     const fetchLocationTypes = async () => {
//       try {
//         setIsLoading(true);
//         const res = await LayerApi.getLayersByType('location');
//         const options = res.map(item => ({
//           key: item.id,
//           value: item.name
//         }));
//         setLocationTypes(options);
//       } catch (error) {
//         Alert.alert('Error', 'Failed to load location types');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchLocationTypes();
//   }, []);

//   const pickImage = () => {
//     launchImageLibrary({ 
//       mediaType: 'photo', 
//       quality: 0.8,
//       includeBase64: false
//     }, (response) => {
//       if (!response.didCancel && !response.error && response.assets?.[0]) {
//         setFormData(prev => ({
//           ...prev,
//           image: response.assets[0]
//         }));
//       }
//     });
//   };

//   const handleMapPress = (event) => {
//     const { lat, lng } = JSON.parse(event.nativeEvent.data);
//     setFormData(prev => ({
//       ...prev,
//       latitude: lat,
//       longitude: lng
//     }));
//     setConfirmModalVisible(true);
//   };

//   const handleFormChange = (name, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleAddLocation = async () => {
//     const { name, type, latitude, longitude } = formData;
    
//     if (!latitude || !longitude) {
//       Alert.alert('Error', 'Please select a location on the map');
//       return;
//     }

//     if (!type) {
//       Alert.alert('Error', 'Please select a location type');
//       return;
//     }

//     if (!name) {
//       Alert.alert('Error', 'Please enter a location name');
//       return;
//     }

//     try {
//       setIsLoading(true);
      
//       // Create FormData object
//       const data = new FormData();
//       data.append('name', name);
//       data.append('type', type);
//       data.append('latitude', latitude.toString());
//       data.append('longitude', longitude.toString());
//       data.append('description', formData.description);
      
//       if (formData.image) {
//         data.append('image', {
//           uri: formData.image.uri,
//           type: formData.image.type || 'image/jpeg',
//           name: formData.image.fileName || `location_${Date.now()}.jpg`
//         });
//       }

//       const response = await mapLocationApi.addLocation(data);

//       Alert.alert('Success', response.message || 'Location added successfully');
//       resetForm();
//     } catch (error) {
//       console.error('API Error:', error);
//       Alert.alert(
//         'Error', 
//         error.response?.data?.message || 'Failed to add location'
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       longitude: null,
//       latitude: null,
//       description: '',
//       type: '',
//       image: null
//     });
//     setFormModalVisible(false);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           onPress={() => navigation.goBack()} 
//           style={styles.backButton}
//         >
//           <Icon name="arrow-back" size={26} color={colors.white} />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Add New Location</Text>
//       </View>

//       {/* Map View */}
//       <View style={styles.mapContainer}>
//         <Text style={styles.instructionText}>
//           Tap on the map to select location
//         </Text>
//         <WebView
//           source={{ html: generateHTML(MAP_URL) }}
//           onMessage={handleMapPress}
//           style={styles.map}
//           originWhitelist={["*"]}
//         />
//       </View>

//       {/* Location Confirmation Modal */}
//       <Modal
//         visible={isConfirmModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setConfirmModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Icon name="location" size={24} color={colors.primary} />
//               <Text style={styles.modalTitle}>Confirm Location</Text>
//             </View>
            
//             <Text style={styles.modalText}>
//               You've selected this location:
//             </Text>
//             <Text style={styles.coordinatesText}>
//               Latitude: {formData.latitude?.toFixed(6)}
//             </Text>
//             <Text style={styles.coordinatesText}>
//               Longitude: {formData.longitude?.toFixed(6)}
//             </Text>
            
//             <View style={styles.modalButtonContainer}>
//               <TouchableOpacity 
//                 style={[styles.modalButton, styles.cancelButton]} 
//                 onPress={() => setConfirmModalVisible(false)}
//               >
//                 <Text style={styles.modalButtonText}>Cancel</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={styles.modalButton} 
//                 onPress={() => {
//                   setConfirmModalVisible(false);
//                   setFormModalVisible(true);
//                 }}
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <ActivityIndicator color={colors.white} />
//                 ) : (
//                   <Text style={styles.modalButtonText}>Continue</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Location Form Modal */}
//       <Modal
//         visible={isFormModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setFormModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <ScrollView
//             contentContainerStyle={styles.scrollContainer}
//             keyboardShouldPersistTaps="handled"
//           >
//             <View style={styles.formContainer}>
//               <View style={styles.formHeader}>
//                 <Icon name="pencil" size={24} color={colors.primary} />
//                 <Text style={styles.formTitle}>Location Details</Text>
//               </View>

//               <Text style={styles.label}>Location Name *</Text>
//               <TextInput
//                 style={styles.input}
//                 value={formData.name}
//                 onChangeText={(text) => handleFormChange('name', text)}
//                 placeholder="Enter location name"
//                 placeholderTextColor={colors.gray}
//               />

//               <Text style={styles.label}>Location Type *</Text>
//               <SelectList
//                 setSelected={(val) => handleFormChange('type', val)}
//                 data={locationTypes}
//                 save="value"
//                 placeholder="Select location type"
//                 search={false}
//                 boxStyles={styles.dropdownBox}
//                 inputStyles={styles.dropdownInput}
//                 dropdownStyles={styles.dropdownList}
//                 dropdownTextStyles={styles.dropdownText}
//               />

//               <Text style={styles.label}>Description</Text>
//               <TextInput
//                 style={[styles.input, styles.multilineInput]}
//                 value={formData.description}
//                 onChangeText={(text) => handleFormChange('description', text)}
//                 placeholder="Enter description (optional)"
//                 placeholderTextColor={colors.gray}
//                 multiline
//                 numberOfLines={4}
//               />

//               <Text style={styles.label}>Location Image</Text>
//               <TouchableOpacity 
//                 style={styles.imageButton} 
//                 onPress={pickImage}
//                 disabled={isLoading}
//               >
//                 <Icon name="image" size={20} color={colors.white} />
//                 <Text style={styles.imageButtonText}>
//                   {formData.image ? 'Change Image' : 'Select Image'}
//                 </Text>
//               </TouchableOpacity>

//               {formData.image && (
//                 <View style={styles.imagePreviewContainer}>
//                   <Image 
//                     source={{ uri: formData.image.uri }} 
//                     style={styles.imagePreview} 
//                   />
//                   <TouchableOpacity
//                     style={styles.removeImageButton}
//                     onPress={() => handleFormChange('image', null)}
//                   >
//                     <Icon name="close" size={16} color={colors.white} />
//                   </TouchableOpacity>
//                 </View>
//               )}

//               <View style={styles.coordinatesContainer}>
//                 <Text style={styles.coordinatesLabel}>Coordinates:</Text>
//                 <Text style={styles.coordinatesValue}>
//                   {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}
//                 </Text>
//               </View>

//               <TouchableOpacity 
//                 style={styles.submitButton} 
//                 onPress={handleAddLocation}
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <ActivityIndicator color={colors.white} />
//                 ) : (
//                   <Text style={styles.submitButtonText}>Save Location</Text>
//                 )}
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.cancelFormButton}
//                 onPress={resetForm}
//                 disabled={isLoading}
//               >
//                 <Text style={styles.cancelFormButtonText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     paddingHorizontal: 15,
//     backgroundColor: colors.primary,
//     borderBottomLeftRadius: 10,
//     borderBottomRightRadius: 10,
//     elevation: 3,
//   },
//   backButton: {
//     padding: 5,
//     marginRight: 10,
//   },
//   headerText: {
//     flex: 1,
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: colors.white,
//   },
//   mapContainer: {
//     flex: 1,
//     margin: 10,
//     borderRadius: 12,
//     overflow: 'hidden',
//     elevation: 3,
//   },
//   instructionText: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     color: colors.white,
//     padding: 12,
//     textAlign: 'center',
//     fontSize: 14,
//   },
//   map: {
//     flex: 1,
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContainer: {
//     width: '85%',
//     backgroundColor: colors.white,
//     borderRadius: 12,
//     padding: 20,
//     elevation: 5,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//     justifyContent: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginLeft: 10,
//     color: colors.darkGray,
//   },
//   modalText: {
//     fontSize: 16,
//     color: colors.darkGray,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   coordinatesText: {
//     fontSize: 14,
//     color: colors.gray,
//     textAlign: 'center',
//     marginBottom: 5,
//     fontFamily: 'monospace',
//   },
//   modalButtonContainer: {
//     flexDirection: 'row',
//     marginTop: 20,
//     justifyContent: 'space-between',
//   },
//   modalButton: {
//     flex: 1,
//     padding: 12,
//     backgroundColor: colors.primary,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   cancelButton: {
//     backgroundColor: colors.danger,
//   },
//   modalButtonText: {
//     color: colors.white,
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     width: '100%',
//     paddingVertical: 20,
//   },
//   formContainer: {
//     width: '90%',
//     backgroundColor: colors.white,
//     borderRadius: 12,
//     padding: 25,
//     elevation: 5,
//   },
//   formHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//     justifyContent: 'center',
//   },
//   formTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginLeft: 10,
//     color: colors.darkGray,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.darkGray,
//     marginBottom: 8,
//     marginTop: 15,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: colors.lightGray,
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     color: colors.darkGray,
//     backgroundColor: colors.white,
//   },
//   multilineInput: {
//     minHeight: 100,
//     textAlignVertical: 'top',
//   },
//   dropdownBox: {
//     borderWidth: 1,
//     borderColor: colors.lightGray,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },
//   dropdownInput: {
//     fontSize: 16,
//     color: colors.darkGray,
//   },
//   dropdownList: {
//     borderWidth: 1,
//     borderColor: colors.lightGray,
//     borderRadius: 8,
//   },
//   dropdownText: {
//     fontSize: 16,
//     color: colors.darkGray,
//   },
//   imageButton: {
//     flexDirection: 'row',
//     backgroundColor: colors.primary,
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 15,
//   },
//   imageButtonText: {
//     color: colors.white,
//     fontWeight: '600',
//     marginLeft: 10,
//     fontSize: 16,
//   },
//   imagePreviewContainer: {
//     position: 'relative',
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   imagePreview: {
//     width: '100%',
//     height: 200,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: colors.lightGray,
//   },
//   removeImageButton: {
//     position: 'absolute',
//     top: -10,
//     right: -10,
//     backgroundColor: colors.danger,
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   coordinatesContainer: {
//     marginVertical: 15,
//     padding: 10,
//     backgroundColor: colors.lightGray,
//     borderRadius: 8,
//   },
//   coordinatesLabel: {
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   coordinatesValue: {
//     fontFamily: 'monospace',
//   },
//   submitButton: {
//     backgroundColor: colors.primary,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   submitButtonText: {
//     color: colors.white,
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   cancelFormButton: {
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//     borderWidth: 1,
//     borderColor: colors.lightGray,
//   },
//   cancelFormButtonText: {
//     color: colors.darkGray,
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default AddLocationScreen;


import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Image, 
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import WebView from 'react-native-webview';
import { launchImageLibrary } from 'react-native-image-picker';
import mapLocationApi from '../../Api/MapLocationApi';
import layerApi from '../../Api/LayerApi';
import Icon from 'react-native-vector-icons/Ionicons';
import { MAP_URL } from '../../Api/BaseConfig';
import { SelectList } from 'react-native-dropdown-select-list';
import debounce from 'lodash.debounce';

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

// const generateHTML = (MAP_URL, markerPosition = null) => `
//   <!DOCTYPE html>
//   <html>
//   <head>
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
//     <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
//     <style>
//       body, html { margin: 0; padding: 0; height: 100%; }
//       #map { height: 100%; }
//       .custom-marker {
//         background-color: rgb(73, 143, 235);
//         width: 20px;
//         height: 20px;
//         border-radius: 50%;
//         border: 2px solid white;
//       }
//     </style>
//   </head>
//   <body>
//     <div id="map"></div>
//     <script>
//       var map = L.map('map').setView([33.6844, 73.0479], 13);
//       L.tileLayer('${MAP_URL}').addTo(map);
      
//       var marker;
//       ${markerPosition ? `
//         marker = L.marker([${markerPosition.lat}, ${markerPosition.lng}], {
//           icon: L.divIcon({ className: 'custom-marker' })
//         }).addTo(map);
//       ` : ''}
      
//       map.on('click', function(e) {
//         if (marker) {
//           marker.setLatLng(e.latlng);
//         } else {
//           marker = L.marker(e.latlng, {
//             icon: L.divIcon({ className: 'custom-marker' })
//           }).addTo(map);
//         }
//         window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
//       });
      
//       // Add zoom control
//       L.control.zoom({ position: "topright" }).addTo(map);
//     </script>
//   </body>
//   </html>
// `;
const generateHTML = (MAP_URL, markerPosition = null) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <style>
      body, html { margin: 0; padding: 0; height: 100%; }
      #map { height: 100%; }
      .custom-marker {
        background-color: rgb(73, 143, 235);
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map = L.map('map').setView([33.6844, 73.0479], 13);
      L.tileLayer('${MAP_URL}').addTo(map);
      
      var marker;
      var searchMarkers = [];
      
      ${markerPosition ? `
        marker = L.marker([${markerPosition.lat}, ${markerPosition.lng}], {
          icon: L.divIcon({ className: 'custom-marker' })
        }).addTo(map);
      ` : ''}
      
      map.on('click', function(e) {
        if (marker) {
          marker.setLatLng(e.latlng);
        } else {
          marker = L.marker(e.latlng, {
            icon: L.divIcon({ className: 'custom-marker' })
          }).addTo(map);
        }
        window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
      });
      
      // Add zoom control
      L.control.zoom({ position: "topright" }).addTo(map);
    </script>
  </body>
  </html>
`;

const AddLocationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    longitude: null,
    latitude: null,
    description: '',
    type: '',
    image: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isFormModalVisible, setFormModalVisible] = useState(false);
  const [locationTypes, setLocationTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchMarkers, setSearchMarkers] = useState([]);
  const webViewRef = useRef(null);

  // Fetch location types on mount
  useEffect(() => {
    const fetchLocationTypes = async () => {
      try {
        setIsLoading(true);
        const res = await layerApi.getLayersByType('location');
        const options = res.map(item => ({
          key: item.id,
          value: item.name
        }));
        setLocationTypes(options);
      } catch (error) {
        Alert.alert('Error', 'Failed to load location types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationTypes();
  }, []);

  // Debounced search function
  const debouncedSearch = debounce(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await mapLocationApi.getMapLocation(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to perform search');
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleSearchResultPress = (result) => {
  // Clear previous search markers
  if (webViewRef.current) {
    webViewRef.current.injectJavaScript(`
      if (searchMarkers) {
        for (let i = 0; i < searchMarkers.length; i++) {
          map.removeLayer(searchMarkers[i]);
        }
        searchMarkers = [];
      }
    `);
  }

  // Center map on the selected location
  const { lat, lon } = result;
  if (webViewRef.current) {
    webViewRef.current.injectJavaScript(`
      map.setView([${lat}, ${lon}], 15);
      
      // Add new marker for this result
      if (!searchMarkers) var searchMarkers = [];
      var marker = L.marker([${lat}, ${lon}], {
        icon: L.divIcon({ className: 'custom-marker' })
      }).addTo(map)
        .bindPopup('${result.display_name.replace(/'/g, "\\'")}');
      
      searchMarkers.push(marker);
      
      // Send marker position back to React Native
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'searchMarker',
        lat: ${lat},
        lng: ${lon}
      }));
    `);
  }

  // Clear search results
  setSearchQuery('');
  setSearchResults([]);
};

  const pickImage = () => {
    launchImageLibrary({ 
      mediaType: 'photo', 
      quality: 0.8,
      includeBase64: false
    }, (response) => {
      if (!response.didCancel && !response.error && response.assets?.[0]) {
        setFormData(prev => ({
          ...prev,
          image: response.assets[0]
        }));
      }
    });
  };

  const handleMapMessage = (event) => {
  const data = JSON.parse(event.nativeEvent.data);
  
  // Regular map click handling
  const { lat, lng } = data;
  setFormData(prev => ({
    ...prev,
    latitude: lat,
    longitude: lng
  }));
  setConfirmModalVisible(true);
};

  const handleFormChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddLocation = async () => {
    const { name, type, latitude, longitude } = formData;
    
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
      setIsLoading(true);
      
      // Create FormData object
      const data = new FormData();
      data.append('name', name);
      data.append('type', type);
      data.append('latitude', latitude.toString());
      data.append('longitude', longitude.toString());
      data.append('description', formData.description);
      
      if (formData.image) {
        data.append('image', {
          uri: formData.image.uri,
          type: formData.image.type || 'image/jpeg',
          name: formData.image.fileName || `location_${Date.now()}.jpg`
        });
      }

      const response = await mapLocationApi.addLocation(data);

      Alert.alert('Success', response.message || 'Location added successfully');
      resetForm();
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to add location'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      longitude: null,
      latitude: null,
      description: '',
      type: '',
      image: null
    });
    setFormModalVisible(false);
    setSearchMarkers([]);
  };

  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.searchResultItem}
      onPress={() => handleSearchResultPress(item)}
    >
      <Icon name="location" size={20} color={colors.primary} style={styles.searchResultIcon} />
      <View style={styles.searchResultTextContainer}>
        <Text style={styles.searchResultTitle} numberOfLines={1}>
          {item.display_name}
        </Text>
        <Text style={styles.searchResultSubtitle} numberOfLines={1}>
          {item.type || 'Location'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Add New Location</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for locations..."
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery ? (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Icon name="close" size={18} color={colors.gray} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResultItem}
            keyExtractor={(item, index) => `${item.place_id || index}`}
            keyboardShouldPersistTaps="always"
            style={styles.searchResultsList}
          />
        </View>
      )}

      {/* Map View */}
      <View style={styles.mapContainer}>
        <Text style={styles.instructionText}>
          Tap on the map to select location
        </Text>
        <WebView
          ref={webViewRef}
          source={{ html: generateHTML(MAP_URL) }}
          onMessage={handleMapMessage}
          style={styles.map}
          originWhitelist={["*"]}
        />
      </View>

      {/* Location Confirmation Modal */}
      <Modal
        visible={isConfirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Icon name="location" size={24} color={colors.primary} />
              <Text style={styles.modalTitle}>Confirm Location</Text>
            </View>
            
            <Text style={styles.modalText}>
              You've selected this location:
            </Text>
            <Text style={styles.coordinatesText}>
              Latitude: {formData.latitude?.toFixed(6)}
            </Text>
            <Text style={styles.coordinatesText}>
              Longitude: {formData.longitude?.toFixed(6)}
            </Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => {
                  setConfirmModalVisible(false);
                  setFormModalVisible(true);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Form Modal */}
      <Modal
        visible={isFormModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFormModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
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
                value={formData.name}
                onChangeText={(text) => handleFormChange('name', text)}
                placeholder="Enter location name"
                placeholderTextColor={colors.gray}
              />

              <Text style={styles.label}>Location Type *</Text>
              <SelectList
                setSelected={(val) => handleFormChange('type', val)}
                data={locationTypes}
                save="value"
                placeholder="Select location type"
                search={false}
                boxStyles={styles.dropdownBox}
                inputStyles={styles.dropdownInput}
                dropdownStyles={styles.dropdownList}
                dropdownTextStyles={styles.dropdownText}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.description}
                onChangeText={(text) => handleFormChange('description', text)}
                placeholder="Enter description (optional)"
                placeholderTextColor={colors.gray}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Location Image</Text>
              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={pickImage}
                disabled={isLoading}
              >
                <Icon name="image" size={20} color={colors.white} />
                <Text style={styles.imageButtonText}>
                  {formData.image ? 'Change Image' : 'Select Image'}
                </Text>
              </TouchableOpacity>

              {formData.image && (
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: formData.image.uri }} 
                    style={styles.imagePreview} 
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleFormChange('image', null)}
                  >
                    <Icon name="close" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesLabel}>Coordinates:</Text>
                <Text style={styles.coordinatesValue}>
                  {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleAddLocation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Save Location</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelFormButton}
                onPress={resetForm}
                disabled={isLoading}
              >
                <Text style={styles.cancelFormButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Location Button */}
      {/* <TouchableOpacity
        style={styles.addButton}
        onPress={() => setFormModalVisible(true)}
        disabled={!formData.latitude || !formData.longitude}
      >
        <Icon name="add" size={28} color={colors.white} />
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 3,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: colors.darkGray,
  },
  clearSearchButton: {
    padding: 5,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 110,
    left: 15,
    right: 15,
    maxHeight: 200,
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  searchResultsList: {
    padding: 10,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  searchResultIcon: {
    marginRight: 10,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 15,
    color: colors.darkGray,
  },
  searchResultSubtitle: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  instructionText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: colors.white,
    padding: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
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
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  formContainer: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 25,
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
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  dropdownInput: {
    fontSize: 16,
    color: colors.darkGray,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    marginTop: 5,
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
    width: '100%',
    height: 200,
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
  },
  coordinatesContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  coordinatesLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  coordinatesValue: {
    fontFamily: 'monospace',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
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
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default AddLocationScreen;