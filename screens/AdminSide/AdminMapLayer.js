// import React, { useEffect, useState, useRef } from 'react';
// import { View, ActivityIndicator, Text, StyleSheet, Modal, Image, TouchableOpacity, TextInput, FlatList, ScrollView } from 'react-native';
// import WebView from 'react-native-webview';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { BASE_URL, MAP_URL } from '../../Api/BaseConfig';
// import mapLocationApi from '../../Api/MapLocationApi';

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

// // Threat level colors
// const threatColors = {
//   'Low': '#10B981',
//   'Medium': '#F59E0B',
//   'High': '#EF4444',
//   'Critical': '#8B0000'
// };

// // Custom marker icons
// const iconMap = {
//   hospital: `${BASE_URL}/uploads/icons/hospital.png`,
//   ptcl: `${BASE_URL}/uploads/icons/ptcl.png`,
//   toll: `${BASE_URL}/uploads/icons/Toll.png`,
//   police: `${BASE_URL}/uploads/icons/police(1).png`,
//   school: `${BASE_URL}/uploads/icons/school.png`,
//   restaurant: `${BASE_URL}/uploads/icons/resturant.png`,
//   atm: `${BASE_URL}/uploads/icons/atm.png`,
//   fuel: `${BASE_URL}/uploads/icons/fuel.png`,
//   park: `${BASE_URL}/uploads/icons/park (2).png`,
// };

// const layerTypes = [
//   { id: 'hospital', name: 'Hospitals', icon: 'local-hospital' },
//   { id: 'ptcl', name: 'PTCL Offices', icon: 'business' },
//   { id: 'toll', name: 'Toll Plazas', icon: 'attach-money' },
//   { id: 'police', name: 'Police Stations', icon: 'security' },
//   { id: 'school', name: 'Schools', icon: 'school' },
//   { id: 'restaurant', name: 'Restaurants', icon: 'restaurant' },
//   { id: 'atm', name: 'ATMs/Banks', icon: 'account-balance' },
//   { id: 'fuel', name: 'Fuel Stations', icon: 'local-gas-station' },
//   { id: 'park', name: 'Parks', icon: 'park' },
//   // { id: 'threat', name: 'Threat Areas', icon: 'warning' },
//   // { id: 'lines', name: 'Transport Lines', icon: 'alt-route' }
// ];

// const AdminMapScreen = ({navigation}) => {
//   const [locations, setLocations] = useState([]);
//   const [threats, setThreats] = useState([]);
//   const [lines, setLines] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredLocations, setFilteredLocations] = useState([]);
//   const [activeLayer, setActiveLayer] = useState(null);
//   const [showLayers, setShowLayers] = useState(false);
//   const [showThreats, setShowThreats] = useState(false);
//   const [showLines, setShowLines] = useState(false);
//   const mapRef = useRef(null);

//   useEffect(() => { 
//     if (activeLayer) {
//       fetchLayerLocations(activeLayer);
//     }
//     // Always fetch threats and lines if their toggles are on
//     if (showThreats) fetchThreats();
//     if (showLines) fetchLines();
//   }, [activeLayer, showThreats, showLines]);

//   const fetchLayerLocations = async (layer) => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await mapLocationApi.getLocationByType({type: layer});
//       setLocations(data);
//     } catch (err) {
//       setError(`Failed to fetch ${layer} data. Please try again.`);
//       setLocations([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchThreats = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await mapLocationApi.getThreats();
//       setThreats(response.data);
//     } catch (err) {
//       setError('Failed to fetch threat data. Please try again.');
//       setThreats([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchLines = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await mapLocationApi.getLines();
//       setLines(data);
//     } catch (err) {
//       setError('Failed to fetch transport lines. Please try again.');
//       setLines([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (query) => {
//     setSearchQuery(query);
//     if (query) {
//       setFilteredLocations(locations.filter(loc => 
//         loc.name.toLowerCase().includes(query.toLowerCase())
//       ))
//     } else {
//       setFilteredLocations([]);
//     }
//   };

//   const handleLocationSelect = (location) => {
//     setSearchQuery(location.name);
//     setFilteredLocations([]);
//     if (location.loc_type === 'threat') setShowThreats(true);
//     if (location.loc_type === 'lines') setShowLines(true);
//     mapRef.current?.injectJavaScript(`
//       map.setView([${location.latitude}, ${location.longitude}], 18);
//     `);
//   };

//   const generateMapHtml = (MAP_URL) => {
//     const markersScript = locations.map(loc => `
//       L.marker([${loc.latitude}, ${loc.longitude}], {
//         icon: L.icon({
//           iconUrl: '${iconMap[loc.loc_type]}',
//           iconSize: [32, 32],
//           iconAnchor: [16, 32],
//           popupAnchor: [0, -32]
//         })
//       }).addTo(map)
//       .on('click', function() {
//         window.ReactNativeWebView.postMessage(JSON.stringify({ 
//           type: 'location',
//           name: "${loc.name}", 
//           description: "${loc.description}", 
//           image_url: "${loc.image_url}",
//           loc_type: "${loc.loc_type}"
//         }));
//       });
//     `).join('\n');

//     const threatsScript = showThreats ? threats.map(threat => {
//       const coordinates = threat.path.map(coord => `[${coord[0]}, ${coord[1]}]`).join(', ');
//       const color = threatColors[threat.threat_level] || threatColors['Medium'];
//       return `
//         L.polygon([${coordinates}], {
//           color: '${color}',
//           fillColor: '${color}',
//           fillOpacity: 0.4,
//           weight: 2
//         }).addTo(map)
//         .on('click', function() {
//           window.ReactNativeWebView.postMessage(JSON.stringify({
//             type: 'threat',
//             name: "${threat.threat_level}",
//             description: "${threat.description || 'Potential threat area'}",
//             start_time: "${threat.start_time}",
//             end_time: "${threat.end_time}"
//           }));
//         });
//       `;
//     }).join('\n') : '';

//     const linesScript = showLines ? lines.map(line => {
//       const coordinates = line.coordinates.map(coord => `[${coord[1]}, ${coord[0]}]`).join(', ');
//       let lineColor = '#1e40af';
//       let dashArray = null;
      
//       switch(line.category) {
//         case 'ptcl':
//           lineColor = '#7e22ce';
//           break;
//         case 'railway':
//           lineColor = '#1e293b';
//           break;
//         case 'highways':
//           lineColor = '#f59e0b';
//           break;
//         case 'threat':
//           lineColor = '#dc2626';
//           dashArray = '10, 10';
//           break;
//       }

//       return `
//         L.polyline([${coordinates}], {
//           color: '${lineColor}',
//           weight: 4,
//           opacity: 0.8,
//           dashArray: ${dashArray ? `'${dashArray}'` : 'null'}
//         }).addTo(map)
//         .on('click', function() {
//           window.ReactNativeWebView.postMessage(JSON.stringify({
//             type: 'line',
//             name: "${line.name}",
//             description: "${line.description || ''}",
//             category: "${line.category}"
//           }));
//         });
//       `;
//     }).join('\n') : '';

//     return `
//       <html>
//         <head>
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
//           <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
//           <style>
//             body { margin: 0; padding: 0; }
//             #map { height: 100vh; }
//           </style>
//         </head>
//         <body>
//           <div id="map"></div>
//           <script>
//             var map = L.map('map', {zoomControl:false}).setView([33.6844, 73.0479], 12);
//             L.control.zoom({position:'bottomright'}).addTo(map);
//             L.tileLayer('${MAP_URL}').addTo(map);
//             ${markersScript}
//             ${threatsScript}
//             ${linesScript}
//           </script>
//         </body>
//       </html>
//     `;
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return 'Unknown';
//     const [hours, minutes] = timeString.split(':');
//     const date = new Date();
//     date.setHours(hours);
//     date.setMinutes(minutes);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={26} color={colors.white} />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Map Layers</Text>
//       </View>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <View style={styles.searchBarContainer}>
//           <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
//           <TextInput
//             style={styles.searchBar}
//             placeholder="Search location..."
//             placeholderTextColor={colors.gray}
//             value={searchQuery}
//             onChangeText={handleSearch}
//           />
//           <TouchableOpacity 
//             style={styles.layerButton}
//             onPress={() => setShowLayers(!showLayers)}
//           >
//             <MaterialIcons name="layers" size={24} color={colors.white} />
//           </TouchableOpacity>
//         </View>

//         {/* Search Suggestions */}
//         {searchQuery.length > 0 && (
//           <FlatList
//             data={filteredLocations}
//             keyExtractor={(item) => item.id.toString()}
//             style={styles.suggestionsList}
//             renderItem={({ item }) => (
//               <TouchableOpacity 
//                 style={styles.suggestionItem} 
//                 onPress={() => handleLocationSelect(item)}
//               >
//                 <MaterialIcons 
//                   name={layerTypes.find(l => l.id === item.loc_type)?.icon || 'place'} 
//                   size={20} 
//                   color={colors.primary} 
//                   style={styles.suggestionIcon}
//                 />
//                 <Text style={styles.suggestionText}>{item.name}</Text>
//               </TouchableOpacity>
//             )}
//           />
//         )}
//       </View>

//       {/* Layers Panel */}
//       {showLayers && (
//         <View style={styles.layersPanel}>
//           <ScrollView>
//             {layerTypes.map((layer) => (
//               <TouchableOpacity
//                 key={layer.id}
//                 style={[
//                   styles.layerItem,
//                   activeLayer === layer.id && styles.activeLayerItem
//                 ]}
//                 onPress={() => {
//                   setActiveLayer(activeLayer === layer.id ? null : layer.id);
//                   setShowLayers(false);
//                 }}
//               >
//                 <MaterialIcons 
//                   name={layer.icon} 
//                   size={24} 
//                   color={activeLayer === layer.id ? colors.white : colors.primary} 
//                 />
//                 <Text style={[
//                   styles.layerText,
//                   activeLayer === layer.id && styles.activeLayerText
//                 ]}>
//                   {layer.name}
//                 </Text>
//                 {activeLayer === layer.id && (
//                   <View style={[
//                     styles.layerBadge,
//                     activeLayer === layer.id && styles.activeLayerBadge
//                   ]}>
//                     <Text style={[
//                       styles.layerBadgeText,
//                       activeLayer === layer.id && styles.activeLayerBadgeText
//                     ]}>
//                       {layer.id === 'threat' ? threats.length : 
//                        layer.id === 'lines' ? lines.length : 
//                        locations.length}
//                     </Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       )}

//       {/* Always visible layer toggle buttons */}
//       <View style={styles.layerToggleContainer}>
//         <TouchableOpacity 
//           style={[
//             styles.layerToggleButton,
//             showThreats && styles.layerToggleButtonActive
//           ]}
//           onPress={() => setShowThreats(!showThreats)}
//         >
//           <MaterialIcons 
//             name="warning" 
//             size={20} 
//             color={showThreats ? colors.white : colors.primary} 
//           />
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={[
//             styles.layerToggleButton,
//             showLines && styles.layerToggleButtonActive
//           ]}
//           onPress={() => setShowLines(!showLines)}
//         >
//           <MaterialIcons 
//             name="alt-route" 
//             size={20} 
//             color={showLines ? colors.white : colors.primary} 
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Map or Loading/Error State */}
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//           <Text style={styles.loadingText}>Loading map data...</Text>
//         </View>
//       ) : error ? (
//         <View style={styles.errorContainer}>
//           <MaterialIcons name="error-outline" size={40} color={colors.danger} />
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity 
//             style={styles.retryButton}
//             onPress={() => {
//               if (activeLayer === 'threat') fetchThreats();
//               else if (activeLayer === 'lines') fetchLines();
//               else if (activeLayer) fetchLayerLocations(activeLayer);
//             }}
//           >
//             <Text style={styles.retryButtonText}>Try Again</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <WebView
//           ref={mapRef}
//           originWhitelist={['*']}
//           source={{ html: generateMapHtml(MAP_URL) }}
//           onMessage={(event) => {
//             const data = JSON.parse(event.nativeEvent.data);
//             setSelectedLocation(data);
//             setModalVisible(true);
//           }}
//           style={styles.map}
//           startInLoadingState={true}
//           renderLoading={() => (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color={colors.primary} />
//             </View>
//           )}
//         />
//       )}

//       {/* Location Details Modal */}
//       <Modal visible={modalVisible} transparent animationType="fade">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <TouchableOpacity 
//               style={styles.closeButton} 
//               onPress={() => setModalVisible(false)}
//             >
//               <Ionicons name="close" size={24} color={colors.darkGray} />
//             </TouchableOpacity>
            
//             {selectedLocation?.type === 'threat' ? (
//               <>
//                 <View style={[styles.locationTypeBadge, { 
//                   backgroundColor: threatColors[selectedLocation.name] || colors.danger 
//                 }]}>
//                   <MaterialIcons name="warning" size={16} color={colors.white} />
//                   <Text style={styles.locationTypeText}>Threat Area: {selectedLocation.name}</Text>
//                 </View>
//                 <Text style={styles.modalDescription}>{selectedLocation.description}</Text>
//                 <View style={styles.timeContainer}>
//                   <Text style={styles.timeLabel}>Active:</Text>
//                   <Text style={styles.timeText}>
//                     {formatTime(selectedLocation.start_time)} - {formatTime(selectedLocation.end_time)}
//                   </Text>
//                 </View>
//               </>
//             ) : selectedLocation?.type === 'line' ? (
//               <>
//                 <View style={styles.locationTypeBadge}>
//                   <MaterialIcons name="alt-route" size={16} color={colors.white} />
//                   <Text style={styles.locationTypeText}>
//                     {selectedLocation.category === 'ptcl' ? 'PTCL Line' : 
//                      selectedLocation.category === 'railway' ? 'Railway' : 
//                      selectedLocation.category === 'highways' ? 'Highway' : 
//                      'Transport Line'}
//                   </Text>
//                 </View>
//                 <Text style={styles.modalTitle}>{selectedLocation.name}</Text>
//                 <Text style={styles.modalDescription}>{selectedLocation.description}</Text>
//               </>
//             ) : selectedLocation ? (
//               <>
//                 <View style={styles.locationTypeBadge}>
//                   <MaterialIcons 
//                     name={layerTypes.find(l => l.id === selectedLocation.loc_type)?.icon || 'place'} 
//                     size={16} 
//                     color={colors.white} 
//                   />
//                   <Text style={styles.locationTypeText}>
//                     {layerTypes.find(l => l.id === selectedLocation.loc_type)?.name || selectedLocation.loc_type}
//                   </Text>
//                 </View>
//                 <Text style={styles.modalTitle}>{selectedLocation.name}</Text>
//                 {selectedLocation.image_url ? (
//                   <Image 
//                     source={{ uri: `${BASE_URL}${selectedLocation.image_url}` }} 
//                     style={styles.modalImage} 
//                     resizeMode="cover"
//                   />
//                 ) : (
//                   <View style={styles.imagePlaceholder}>
//                     <MaterialIcons name="photo" size={50} color={colors.gray} />
//                   </View>
//                 )}
//                 <Text style={styles.modalDescription}>{selectedLocation.description}</Text>
//               </>
//             ) : null}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//     padding: 10
//   },
//   header: {
//     backgroundColor: colors.primary,
//     borderRadius: 10,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     flexDirection: "row"
//   },
//   backButton: {
//     padding: 5,
//     marginRight: 10,
//   },
//   headerText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: colors.white,
//   },
//   searchContainer: {
//     position: 'absolute',
//     top: 100,
//     left: 20,
//     right: 20,
//     zIndex: 10,
//   },
//   searchBarContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     borderRadius: 25,
//     paddingHorizontal: 15,
//     shadowColor: colors.darkGray,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   searchIcon: {
//     marginRight: 10,
//   },
//   searchBar: {
//     flex: 1,
//     height: 50,
//     color: colors.darkGray,
//     fontSize: 16,
//   },
//   layerButton: {
//     backgroundColor: colors.primary,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 10,
//   },
//   suggestionsList: {
//     backgroundColor: colors.white,
//     borderRadius: 10,
//     maxHeight: 200,
//     marginTop: 5,
//     shadowColor: colors.darkGray,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   suggestionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.lightGray,
//   },
//   suggestionIcon: {
//     marginRight: 10,
//   },
//   suggestionText: {
//     fontSize: 16,
//     color: colors.darkGray,
//   },
//   layersPanel: {
//     position: 'absolute',
//     top: 140,
//     right: 20,
//     backgroundColor: colors.white,
//     borderRadius: 10,
//     padding: 10,
//     zIndex: 20,
//     width: 200,
//     maxHeight: 300,
//     shadowColor: colors.darkGray,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   layerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     borderRadius: 8,
//     marginBottom: 5,
//   },
//   activeLayerItem: {
//     backgroundColor: colors.primary,
//   },
//   layerText: {
//     marginLeft: 10,
//     fontSize: 14,
//     color: colors.darkGray,
//     flex: 1,
//   },
//   activeLayerText: {
//     color: colors.white,
//   },
//   layerBadge: {
//     backgroundColor: colors.white,
//     borderRadius: 10,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     marginLeft: 5,
//   },
//   activeLayerBadge: {
//     backgroundColor: colors.primaryDark,
//   },
//   layerBadgeText: {
//     fontSize: 12,
//     color: colors.primary,
//     fontWeight: 'bold',
//   },
//   activeLayerBadgeText: {
//     color: colors.white,
//   },
//   layerToggleContainer: {
//     position: 'absolute',
//     top: 170,
//     right: 20,
//     zIndex: 10,
//     flexDirection: 'column',
//     gap: 10,
//   },
//   layerToggleButton: {
//     backgroundColor: colors.white,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: colors.darkGray,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   layerToggleButtonActive: {
//     backgroundColor: colors.primary,
//   },
//   map: {
//     flex: 1,
//     marginTop: 10,
//     borderRadius: 10
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.background,
//   },
//   loadingText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: colors.darkGray,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: colors.background,
//   },
//   errorText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: colors.danger,
//     textAlign: 'center',
//   },
//   retryButton: {
//     marginTop: 20,
//     backgroundColor: colors.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//   },
//   retryButtonText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: colors.white,
//     borderRadius: 15,
//     padding: 20,
//     width: '85%',
//     maxHeight: '80%',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 1,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: colors.primaryDark,
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   modalImage: {
//     width: '100%',
//     height: 180,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   imagePlaceholder: {
//     width: '100%',
//     height: 180,
//     borderRadius: 10,
//     backgroundColor: colors.lightGray,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   modalDescription: {
//     fontSize: 16,
//     color: colors.darkGray,
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   directionsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     borderRadius: 25,
//   },
//   directionsButtonText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
//   locationTypeBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.primary,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 15,
//     alignSelf: 'flex-start',
//     marginBottom: 10,
//   },
//   locationTypeText: {
//     color: colors.white,
//     fontSize: 12,
//     fontWeight: 'bold',
//     marginLeft: 5,
//   },
//   timeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: colors.lightGray,
//     borderRadius: 8,
//   },
//   timeLabel: {
//     fontWeight: 'bold',
//     marginRight: 5,
//     color: colors.darkGray,
//   },
//   timeText: {
//     color: colors.darkGray,
//   },
// });

// export default AdminMapScreen;



import React, { useState, useEffect, useRef} from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Image, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MAP_URL, BASE_URL, ICON_IMG_URL } from '../../Api/BaseConfig';
import layerApi from '../../Api/LayerApi';

const AdminMapLayersScreen = () => {
  // State declarations
  const [userLayers, setUserLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState(null);
  const [mapData, setMapData] = useState({
    locations: [],
    threatLocations: [],
    lines: []
  });
  const [popupData, setPopupData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const dropdownHeight = useRef(new Animated.Value(150)).current; // Initial height when open


  // Generate HTML with map initialized
  const getMapHtml = (MAP_URL) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <script>
        // Initialize map immediately
        const map = L.map('map').setView([33.6844, 73.0479], 12);
        L.tileLayer('${MAP_URL}').addTo(map);
        
        // Layer containers
        const layerGroups = {
          markers: L.layerGroup().addTo(map),
          polygons: L.layerGroup().addTo(map),
          polylines: L.layerGroup().addTo(map)
        };
        
        // Handle incoming data from React Native
        window.updateMapData = function(data) {
          // Clear all layers
          Object.values(layerGroups).forEach(group => group.clearLayers());
          
          // Add markers
          if (data.locations && data.locations.length) {
            data.locations.forEach(loc => {
              const marker = L.marker([parseFloat(loc.latitude), parseFloat(loc.longitude)], {
                icon: loc.iconUrl ? L.icon({
                  iconUrl: loc.iconUrl,
                  iconSize: [38, 38],
                  iconAnchor: [19, 38],
                  popupAnchor: [0, -38]
                }) : undefined,
                popupData: {
                  title: loc.name,
                  description: loc.description,
                  image_url: loc.image_url,
                  type: 'location'
                }
              });
              marker.on('click', () => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'popup',
                  data: marker.options.popupData
                }));
              });
              layerGroups.markers.addLayer(marker);
            });
          }
          
          // Add polygons
          if (data.threatLocations && data.threatLocations.length) {
            data.threatLocations.forEach(threat => {
              let color = 'blue';
              if (threat.threat_level.toLowerCase() === 'low') color = '#10B981';
              else if (threat.threat_level.toLowerCase() === 'medium') color = '#F59E0B';
              else if (threat.threat_level.toLowerCase() === 'high') color = '#EF4444';
              else if (threat.threat_level.toLowerCase() === 'critical') {
                color = '#8B0000';
              }
              const polygon = L.polygon(threat.path, {
                color,
                fillColor: color,
                popupData: {
                  title: threat.threat_level,
                  description: threat.start_time + ' - ' + threat.end_time,
                  type: 'threat'
                }
              });
              polygon.on('click', () => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'popup',
                  data: polygon.options.popupData
                }));
              });
              layerGroups.polygons.addLayer(polygon);
            });
          }
          
          // Add polylines
          if (data.lines && data.lines.length) {
            data.lines.forEach(line => {
              let color = 'gray', dashArray = null;
              if (line.category.toLowerCase() === 'ptcl') color = '#7e22ce';
              else if (line.category.toLowerCase() === 'railway') color = '#1e40af';
              else if (line.category.toLowerCase() === 'highway') color = '#f59e0b';
              else if (line.category.toLowerCase() === 'threat') {
                color = '#dc2626';
                dashArray = '6,6';
              }
              
              const polyline = L.polyline(
                line.coordinates.map(([lng, lat]) => [lat, lng]), 
                {
                  color,
                  weight: 6,
                  opacity: 0.8,
                  dashArray,
                  popupData: {
                    title: line.name,
                    description: line.description,
                    type: 'line'
                  }
                }
              );
              polyline.on('click', () => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'popup',
                  data: polyline.options.popupData
                }));
              });
              layerGroups.polylines.addLayer(polyline);
            });
          }
        };
      </script>
    </body>
    </html>
  `;

  // Fetch user layers on mount
  useEffect(() => {
    const fetchLayers = async () => {
      try {
        const res = await layerApi.getAllLayers();
        console.log(res)
        setUserLayers(res);
      } catch (err) {
        console.error("Failed to fetch user layers:", err);
        setError('Failed to load available layers');
      }
    };
    fetchLayers();
  }, []);

  // Fetch layer data when active layer changes
  useEffect(() => {
    if (!activeLayer) return;

    const fetchLayerData = async () => {
      setLoading(true);
      try {
        const selected = userLayers.find(l => l.name === activeLayer);
        if (!selected) return;

        let locations = [];
        let threatLocations = [];
        let lines = [];

        if (selected.type === 'threat') {
          const res = await axios.get(`${BASE_URL}/api/location/threat-simulation/${selected.name}`);
          threatLocations = res.data.data;
        } else if (selected.type === 'line') {
          const res = await axios.get(`${BASE_URL}/api/location/map-lines/${selected.name}`);
          lines = res.data;
        } else if (selected.type === 'location') {
          const res = await axios.post(`${BASE_URL}/api/location/map-locations`, {
            type: selected.name,
          });
          locations = res.data.map(loc => ({
            ...loc,
            iconUrl: selected.image ? `${ICON_IMG_URL}/${selected.image}` : ''
          }));
        }

        setMapData({ locations, threatLocations, lines });
      } catch (err) {
        console.error(`Error fetching data for ${activeLayer}`, err);
        setError('Failed to load layer data');
      } finally {
        setLoading(false);
      }
    };

    fetchLayerData();
  }, [activeLayer, userLayers]);

  // Update WebView when map data changes
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.updateMapData(${JSON.stringify(mapData)});
        true;
      `);
    }
  }, [mapData]);
  
  
  // Toggle dropdown animation
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    Animated.timing(dropdownHeight, {
      toValue: isDropdownOpen ? 0 : 150, // 0 when closed, 150 when open
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Modify your sidebar header to be clickable
  const renderSidebarHeader = () => (
    <TouchableOpacity 
      style={styles.sidebarHeader} 
      onPress={toggleDropdown}
      activeOpacity={0.8}
    >
      <Text style={styles.sidebarTitle}>Assigned Layers</Text>
      <View style={styles.headerIcons}>
        {loading && <ActivityIndicator color="#fff" style={styles.loadingIndicator} />}
        <Text style={styles.dropdownIcon}>
          {isDropdownOpen ? '▲' : '▼'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Update your sidebar content to use animated height
  const renderSidebarContent = () => (
    <Animated.View style={[styles.sidebarContent, { height: dropdownHeight }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {userLayers.map((layer) => (
          <TouchableOpacity
            key={layer.id}
            onPress={() => setActiveLayer(layer.name)}
            style={[
              styles.layerItem,
              activeLayer === layer.name && styles.activeLayerItem
            ]}
          >
            <Image
              source={{ uri: `${ICON_IMG_URL}/${layer.image}` }}
              style={styles.layerIcon}
            />
            <Text style={styles.layerText}>{layer.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
  // Handle WebView messages
  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'popup') {
        setPopupData(message.data);
        setModalVisible(true);
      }
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  };

  // Format time for threat zones
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      {/* WebView for Leaflet Map */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: getMapHtml(MAP_URL) }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
      />

      {/* Layer Selection Sidebar */}
      <View style={styles.sidebar}>
        {renderSidebarHeader()}
        {renderSidebarContent()}
      </View>

      {/* Layer Selection Sidebar */}
      {/* <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Assigned Layers</Text>
          {loading && <ActivityIndicator color="#fff" />}
        </View>
        <ScrollView style={styles.sidebarContent}>
          {userLayers.map((layer) => (
            <TouchableOpacity
              key={layer.id}
              onPress={() => setActiveLayer(layer.name)}
              style={[
                styles.layerItem,
                activeLayer === layer.name && styles.activeLayerItem
              ]}
            >
              <Image
                source={{ uri: `${ICON_IMG_URL}/${layer.image}` }}
                style={styles.layerIcon}
              />
              <Text style={styles.layerText}>{layer.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View> */}

      {/* Popup Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{popupData?.title}</Text>
            {popupData?.type === 'threat' ? (
              <View style={styles.timeContainer}>
                <Text style={styles.modalText}>
                  {formatTime(popupData?.description?.split(' - ')[0])} - {formatTime(popupData?.description?.split(' - ')[1])}
                </Text>
              </View>
            ) : (
              <Text style={styles.modalText}>{popupData?.description}</Text>
            )}
            {popupData?.type === 'location' ? (
                  <Image 
                    source={{ uri: `${BASE_URL}${popupData.image_url}` }} 
                    style={styles.modalImage} 
                    resizeMode="cover"
                  />
                ) :(
                  <View style={styles.imagePlaceholder}>
                     <MaterialIcons name="photo" size={50} color={'rgb(180, 180, 180)'} />
                  </View>
                )
            }
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠ {error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorClose}>x</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  webview: {
    flex: 1
  },
  sidebar: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 280,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#2563eb',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  sidebarTitle: {
    color: 'white',
    fontWeight: 'bold'
  },
  sidebarContent: {
    height:150,
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 4,
    borderRadius: 4
  },
  activeLayerItem: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1
  },
  layerIcon: {
    width: 24,
    height: 24,
    marginRight: 10
  },
  layerText: {
    fontSize: 14,
    color: '#374151'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 15,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: 'rgba(230, 230, 230)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  closeButton: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center'
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  errorBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000
  },
  errorText: {
    color: '#b91c1c'
  },
  errorClose: {
    color: '#b91c1c',
    fontSize: 20,
    fontWeight: 'bold'
  },
  sidebarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      backgroundColor: '#2563eb',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    loadingIndicator: {
      marginRight: 10
    },
    dropdownIcon: {
      color: 'white',
      fontSize: 14,
      marginLeft: 8
    },
    sidebarContent: {
      overflow: 'hidden', // Important for animation
      padding: 8
    },
    scrollContent: {
      paddingBottom: 8 // Add some padding at the bottom
    },
});

export default AdminMapLayersScreen;