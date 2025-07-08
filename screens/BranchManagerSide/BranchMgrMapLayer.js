import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Text, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  Animated 
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Storage from '../../utils/localStorage';
import { MAP_URL, BASE_URL, ICON_IMG_URL } from '../../Api/BaseConfig';
import layerApi from '../../Api/LayerApi';

const BranchMgrLayersScreen = () => {
  // State declarations
  const [userLayers, setUserLayers] = useState([]);
  const [publicLayers, setPublicLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState(null);
  const [mapData, setMapData] = useState({
    locations: [],
    threatLocations: [],
    lines: []
  });
  const [popupData, setPopupData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState({
    layers: false,
    data: false
  });
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const dropdownHeight = useRef(new Animated.Value(200)).current;

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
              const polygon = L.polygon(threat.path, {
                color: 'red',
                fillColor: 'red',
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

  // Fetch both user and public layers on mount
  useEffect(() => {
    const fetchLayers = async () => {
      try {
        setLoading(prev => ({ ...prev, layers: true }));
        const user = await Storage.get("user");
        const [userRes, publicRes] = await Promise.all([
          layerApi.getUserAssignedLayers(user.id),
          axios.get(`${BASE_URL}/api/layers/Layertype/public`)
        ]);
        setUserLayers(userRes);
        setPublicLayers(publicRes.data);
      } catch (err) {
        console.error("Failed to fetch layers:", err);
        setError('Failed to load available layers');
      } finally {
        setLoading(prev => ({ ...prev, layers: false }));
      }
    };
    fetchLayers();
  }, []);

  // Handle layer selection
  const handleLayerSelect = async (layer) => {
    if (!layer) return;
    
    setActiveLayer(layer);
    setLoading(prev => ({ ...prev, data: true }));
    setError(null);
    
    try {
      // Clear previous data
      setMapData({
        locations: [],
        threatLocations: [],
        lines: []
      });

      let locations = [];
      let threatLocations = [];
      let lines = [];

      // Fetch based on layer type
      if (layer.type === 'threat') {
        const res = await axios.get(`${BASE_URL}/api/location/threat-simulation/${layer.name}`);
        threatLocations = res.data.data;
      } 
      else if (layer.type === 'line') {
        const res = await axios.get(`${BASE_URL}/api/location/map-lines/${layer.name}`);
        lines = res.data;
      } 
      else if (layer.type === 'location') {
        const res = await axios.post(`${BASE_URL}/api/location/map-locations`, {
          type: layer.name,
        });
        locations = res.data.map(loc => ({
          ...loc,
          iconUrl: layer.image ? `${ICON_IMG_URL}/${layer.image}` : ''
        }));
      }

      setMapData({ locations, threatLocations, lines });
    } catch (err) {
      setError('Failed to load layer data');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  };

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
      toValue: isDropdownOpen ? 0 : 200,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Render layer items
  const renderLayerItem = (layer, isPublic = false) => (
    <TouchableOpacity
      key={isPublic ? `public-${layer.id}` : `user-${layer.id}`}
      onPress={() => handleLayerSelect(layer)}
      style={[
        styles.layerItem,
        activeLayer?.id === layer.id && (isPublic ? styles.publicActiveLayer : styles.userActiveLayer)
      ]}
    >
      <Image
        source={{ uri: `${ICON_IMG_URL}/${layer.image}` }}
        style={styles.layerIcon}
      />
      <Text style={styles.layerText}>
        {layer.name}
        {isPublic && <Text style={styles.publicLabel}> (Public)</Text>}
      </Text>
      {loading.data && activeLayer?.id === layer.id && (
        <ActivityIndicator size="small" color="#2563eb" style={styles.itemLoading} />
      )}
    </TouchableOpacity>
  );

  // Render sidebar header
  const renderSidebarHeader = () => (
    <TouchableOpacity 
      style={styles.sidebarHeader} 
      onPress={toggleDropdown}
      activeOpacity={0.8}
    >
      <Text style={styles.sidebarTitle}>Map Layers</Text>
      <View style={styles.headerIcons}>
        {loading.layers && <ActivityIndicator color="#fff" style={styles.loadingIndicator} />}
        <MaterialIcons 
          name={isDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
          size={20} 
          color="#fff" 
        />
      </View>
    </TouchableOpacity>
  );

  // Render sidebar content
  const renderSidebarContent = () => (
    <Animated.View style={[styles.sidebarContent, { height: dropdownHeight }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {userLayers.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>YOUR LAYERS</Text>
            {userLayers.map(layer => renderLayerItem(layer))}
          </>
        )}
        
        {publicLayers.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>PUBLIC LAYERS</Text>
            {publicLayers.map(layer => renderLayerItem(layer, true))}
          </>
        )}
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

      {/* Popup Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{popupData?.title}</Text>
            
            {popupData?.type === 'threat' ? (
              <View style={styles.timeContainer}>
                <MaterialIcons name="schedule" size={16} color="#6b7280" />
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
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="photo" size={50} color="#b4b4b4" />
              </View>
            )}

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
          <MaterialIcons name="error-outline" size={20} color="#b91c1c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <MaterialIcons name="close" size={20} color="#b91c1c" />
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
    zIndex: 1000,
    maxHeight: '80%'
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
    fontWeight: 'bold',
    fontSize: 16
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  loadingIndicator: {
    marginRight: 10
  },
  sidebarContent: {
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: 12,
    paddingHorizontal: 8
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 4,
    borderRadius: 4
  },
  userActiveLayer: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1
  },
  publicActiveLayer: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1
  },
  layerIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 12
  },
  layerText: {
    fontSize: 14,
    color: '#374151',
    flex: 1
  },
  publicLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4
  },
  itemLoading: {
    marginLeft: 8
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937'
  },
  modalText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#e6e6e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
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
    color: '#b91c1c',
    flex: 1,
    marginHorizontal: 8
  }
});

export default BranchMgrLayersScreen;