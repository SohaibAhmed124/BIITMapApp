// import React, { useEffect, useState, useRef } from 'react';
// import { View, Text, StyleSheet, Alert } from 'react-native';
// import { SelectList } from 'react-native-dropdown-select-list';
// import { WebView } from 'react-native-webview';
// import AdminService from '../Api/AdminApiService';
// import ManagerApi from '../Api/ManagerApi';
// import LocationApi from '../Api/LocationApi';

// const EmployeeMovementSimulatorScreen = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
//   const [geofences, setGeofences] = useState([]);
//   const webviewRef = useRef(null);

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const response = await AdminService.getAllEmployees();
//       setEmployees(
//         response.employees.map((emp) => ({
//           key: emp.employee_id,
//           value: `${emp.first_name} ${emp.last_name}`,
//         }))
//       );
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch employees.');
//       console.error(error);
//     }
//   };

//   const fetchGeofences = async (employeeId) => {
//     try {
//       const response = await ManagerApi.getAssignedGeofences({ employeeId });
//       setGeofences(response.geofences || []);

//       // Send geofences to WebView
//       if (webviewRef.current) {
//         webviewRef.current.postMessage(JSON.stringify({ type: 'geofences', data: response.geofences }));
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch assigned geofences.');
//       console.error(error);
//     }
//   };

//   const handleEmployeeSelect = (employeeId) => {
//     setSelectedEmployeeId(employeeId);
//     fetchGeofences(employeeId);

//     // Clear previous markers when employee changes
//     if (webviewRef.current) {
//       webviewRef.current.postMessage(JSON.stringify({ type: 'clearMarkers' }));
//     }
//   };

//   const handleMapClick = async (latitude, longitude) => {
//     if (!selectedEmployeeId) {
//       Alert.alert('Select Employee', 'Please select an employee first.');
//       return;
//     }

//     try {
//       await LocationApi.insertUserLocation(selectedEmployeeId, { latitude, longitude });
//       console.log('Location inserted successfully');
//     } catch (error) {
//       console.error('Error inserting location:', error);
//       Alert.alert('Error', 'Failed to insert location.');
//     }
//   };

//   const onWebViewMessage = (event) => {
//     try {
//       const { latitude, longitude } = JSON.parse(event.nativeEvent.data);
//       handleMapClick(latitude, longitude);
//     } catch (error) {
//       console.error('Invalid message from WebView', error);
//     }
//   };

//     const generateHTML = () => {
//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8" />
//           <title>Leaflet Map</title>
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
//           <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
//           <style>
//             #map { height: 100vh; width: 100%; }
//           </style>
//         </head>
//         <body>
//           <div id="map"></div>
//           <script>
//     const map = L.map('map').setView([33.6844, 73.0479], 13); // Default Islamabad center

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '© OpenStreetMap contributors'
//     }).addTo(map);

//     let marker = null;
//     let polygons = [];
//     let previousLatLng = null; // Store previous marker position
//     let polylines = []; // Store polylines

//     document.addEventListener('message', function(event) {
//       const message = JSON.parse(event.data);

//       if (message.type === 'geofences') {
//         polygons.forEach(p => map.removeLayer(p)); // Clear existing
//         polygons = [];

//         message.data.forEach(geofence => {
//           const latlngs = geofence.geofence_boundary.map(point => [point.latitude, point.longitude]);
//           const polygon = L.polygon(latlngs, { color: 'blue' }).addTo(map);
//           polygons.push(polygon);
//           map.fitBounds(polygon.getBounds());
//         });
//       }

//       if (message.type === 'clearMarkers') {
//         if (marker) {
//           map.removeLayer(marker);
//           marker = null;
//         }
//         previousLatLng = null;
//         polylines.forEach(line => map.removeLayer(line));
//         polylines = [];
//       }
//     });

//     map.on('click', function(e) {
//       const { lat, lng } = e.latlng;

//       if (marker) {
//         previousLatLng = marker.getLatLng(); // Save previous position
//         map.removeLayer(marker);
//       }

//       marker = L.marker([lat, lng]).addTo(map);

//       // Draw dashed polyline from previous to current
//       if (previousLatLng) {
//         const polyline = L.polyline([ [previousLatLng.lat, previousLatLng.lng], [lat, lng] ], {
//           color: 'red',
//           weight: 3,
//           dashArray: '5,10', // Dashed style
//         }).addTo(map);
//         polylines.push(polyline);
//       }

//       window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
//     });
//   </script>

//         </body>
//         </html>
//       `;
//     };
  

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Select Employee:</Text>
//       <SelectList
//         setSelected={handleEmployeeSelect}
//         data={employees}
//         placeholder="Select an employee"
//         boxStyles={styles.selectBox}
//         inputStyles={styles.selectInput}
//       />
//       <View style={styles.mapContainer}>
//         <WebView
//           ref={webviewRef}
//           source={{ html: generateHTML() }}
//           onMessage={onWebViewMessage}
//           javaScriptEnabled
//           domStorageEnabled
//           originWhitelist={['*']}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 10 },
//   label: { fontSize: 16, marginBottom: 5 },
//   selectBox: { marginBottom: 10 },
//   selectInput: { fontSize: 16 },
//   mapContainer: { flex: 1, marginTop: 10, borderRadius: 10, overflow: 'hidden' },
// });

// export default EmployeeMovementSimulatorScreen;

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import AdminService from '../Api/AdminApiService';
import ManagerApi from '../Api/ManagerApi';
import LocationApi from '../Api/LocationApi';

const EmployeeMovementSimulatorScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const webviewRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await AdminService.getAllEmployees();
      setEmployees(
        response.employees.map((emp) => ({
          key: emp.employee_id,
          value: `${emp.first_name} ${emp.last_name}`,
        }))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch employees.');
      console.error(error);
    }
  };

  const fetchGeofences = async (employeeId) => {
    try {
      const response = await ManagerApi.getAssignedGeofences({ employeeId });
      setGeofences(response.geofences || []);

      // Send geofences to WebView
      if (webviewRef.current) {
        webviewRef.current.postMessage(JSON.stringify({ type: 'geofences', data: response.geofences }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch assigned geofences.');
      console.error(error);
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    fetchGeofences(employeeId);

    // Clear previous markers when employee changes
    if (webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify({ type: 'clearMarkers' }));
    }
  };

  const handleMapClick = async (latitude, longitude) => {
    if (!selectedEmployeeId) {
      Alert.alert('Select Employee', 'Please select an employee first.');
      return;
    }

    try {
      await LocationApi.insertUserLocation(selectedEmployeeId, { latitude, longitude });
      console.log('Location inserted successfully');
    } catch (error) {
      console.error('Error inserting location:', error);
      Alert.alert('Error', 'Failed to insert location.');
    }
  };

  const onWebViewMessage = (event) => {
    try {
      const { latitude, longitude } = JSON.parse(event.nativeEvent.data);
      handleMapClick(latitude, longitude);
    } catch (error) {
      console.error('Invalid message from WebView', error);
    }
  };

  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Leaflet Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([33.6844, 73.0479], 13); // Default Islamabad center

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          let marker = null;
          let polygons = [];
          let previousLatLng = null; // Store previous marker position
          let polylines = []; // Store polylines

          document.addEventListener('message', function(event) {
            const message = JSON.parse(event.data);

            if (message.type === 'geofences') {
              polygons.forEach(p => map.removeLayer(p)); // Clear existing
              polygons = [];

              message.data.forEach(geofence => {
                const latlngs = geofence.geofence_boundary.map(point => [point.latitude, point.longitude]);
                const polygon = L.polygon(latlngs, { color: '#1E88E5' }).addTo(map);
                polygons.push(polygon);
                map.fitBounds(polygon.getBounds());
              });
            }

            if (message.type === 'clearMarkers') {
              if (marker) {
                map.removeLayer(marker);
                marker = null;
              }
              previousLatLng = null;
              polylines.forEach(line => map.removeLayer(line));
              polylines = [];
            }
          });

          map.on('click', function(e) {
            const { lat, lng } = e.latlng;

            if (marker) {
              previousLatLng = marker.getLatLng(); // Save previous position
              map.removeLayer(marker);
            }

            marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
              })
            }).addTo(map);

            // Draw dashed polyline from previous to current
            if (previousLatLng) {
              const polyline = L.polyline([ [previousLatLng.lat, previousLatLng.lng], [lat, lng] ], {
                color: '#1E88E5',
                weight: 3,
                dashArray: '5,10', // Dashed style
              }).addTo(map);
              polylines.push(polyline);
            }

            window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
          });
        </script>
      </body>
      </html>
    `;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Movement Simulator</Text>
      </View>
      
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Select Employee</Text>
          <SelectList
            setSelected={handleEmployeeSelect}
            data={employees}
            placeholder="Select an employee"
            searchPlaceholder="Search employees..."
            notFoundText="No employees found"
            boxStyles={styles.selectBox}
            inputStyles={styles.selectInput}
            dropdownStyles={styles.dropdown}
            dropdownItemStyles={styles.dropdownItem}
            dropdownTextStyles={styles.dropdownText}
          />
        </View>

        <View style={styles.mapCard}>
          <Text style={styles.mapLabel}>Employee Movement Map</Text>
          <View style={styles.mapContainer}>
            <WebView
              ref={webviewRef}
              source={{ html: generateHTML() }}
              onMessage={onWebViewMessage}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
            />
          </View>
          <Text style={styles.mapInstructions}>
            Tap on the map to simulate employee movement
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E88E5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E88E5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 12,
  },
  mapLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 12,
  },
  mapInstructions: {
    fontSize: 14,
    color: '#757575',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
  },
  selectInput: {
    fontSize: 16,
    color: '#424242',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#424242',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export default EmployeeMovementSimulatorScreen;