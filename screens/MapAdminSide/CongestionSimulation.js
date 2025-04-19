import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Slider from '@react-native-community/slider';

const App = () => {
  const [vehicles, setVehicles] = useState([]);
  const [speed, setSpeed] = useState(40);
  const [isSimulating, setIsSimulating] = useState(false);
  const webViewRef = useRef(null);
  const simulationInterval = useRef(null);

  // Islamabad Road Network (Updated Coordinates)
  const islamabadRoads = [
    // // Srinagar Highway
    // [
    //   [33.567, 72.983], [33.567, 73.0], [33.567, 73.017], 
    //   [33.567, 73.033], [33.567, 73.05], [33.567, 73.067]
    // ],
    // Jinnah Avenue
    [
        [33.65996, 73.08344], [33.66025, 73.08355], [33.66036, 73.08312], [33.66048, 73.08304], [33.66042, 73.08291],
        [33.66057, 73.08248], [33.66086, 73.08261], [33.66093, 73.08237], [33.66097, 73.08236], [33.66111, 73.08241],
        [33.66113, 73.08240], [33.66128, 73.08185], [33.66128, 73.08179], [33.66094, 73.08125], [33.66101, 73.08120],
        [33.66098, 73.08114], [33.66069, 73.08062], [33.66035, 73.08008], [33.65735, 73.07442], [33.65699, 73.07371],
        [33.65675, 73.07341], [33.65502, 73.07011], [33.65315, 73.06658], [33.65319, 73.06642], [33.65229, 73.06472],
        [33.65170, 73.06464], [33.65109, 73.06456], [33.65079, 73.06453], [33.64970, 73.06440], [33.64902, 73.06438],
        [33.64745, 73.06423], [33.64730, 73.06373], [33.64727, 73.06205], [33.64706, 73.06109], [33.64695, 73.06083],
        [33.64698, 73.05794], [33.64658, 73.05685], [33.64646, 73.05635], [33.64638, 73.05607], [33.64636, 73.05451],
        [33.64618, 73.05260], [33.64586, 73.05205], [33.64580, 73.05173], [33.64574, 73.05073], [33.64563, 73.05064],
        [33.64561, 73.05014], [33.64556, 73.04859], [33.64538, 73.04840], [33.64534, 73.04565], [33.64499, 73.04500],
        [33.64493, 73.04487], [33.64488, 73.04445], [33.64321, 73.04427], [33.64253, 73.04368], [33.64240, 73.04265],
        [33.64214, 73.04206], [33.64201, 73.04171], [33.64200, 73.04152], [33.64203, 73.04123], [33.64206, 73.04096],
        [33.64215, 73.04024], [33.64204, 73.04011], [33.64200, 73.03911], [33.64180, 73.03890], [33.64172, 73.03865],
        [33.64156, 73.03846], [33.64151, 73.03837], [33.64150, 73.03795], [33.64156, 73.03775], [33.64165, 73.03754],
        [33.64178, 73.03746], [33.64187, 73.03734], [33.64171, 73.03664], [33.64086, 73.03543], [33.63985, 73.03485],
        [33.63953, 73.03468], [33.63932, 73.03461], [33.63920, 73.03428], [33.63857, 73.03328], [33.63857, 73.03326],
        [33.63867, 73.03326], [33.63878, 73.03129], [33.63860, 73.02984], [33.63849, 73.02983], [33.63853, 73.02980],
        [33.63856, 73.02975], [33.63859, 73.02970], [33.63859, 73.02965], [33.63858, 73.02862], [33.63981, 73.02734],
        [33.64130, 73.02609], [33.64283, 73.02605], [33.64274, 73.02582], [33.64235, 73.02581], [33.64228, 73.02580],
        [33.64197, 73.02578], [33.64190, 73.02531], [33.64136, 73.02499], [33.64100, 73.02480], [33.64083, 73.02381],
        [33.64051, 73.02354], [33.64042, 73.02334], [33.64038, 73.02260], [33.64032, 73.02155], [33.64036, 73.02081],
        [33.64037, 73.02048], [33.64036, 73.02019], [33.64034, 73.01983], [33.64024, 73.01902], [33.63994, 73.01867],
        [33.63982, 73.01856], [33.63978, 73.01726], [33.63932, 73.01705], [33.63924, 73.01691], [33.63917, 73.01583],
        [33.63877, 73.01575], [33.63875, 73.01566], [33.63876, 73.01558], [33.63879, 73.01551], [33.63882, 73.01539],
        [33.63890, 73.01528], [33.63873, 73.01520], [33.63856, 73.01485], [33.63800, 73.01477], [33.63785, 73.01462],
        [33.63781, 73.01447], [33.63766, 73.01406], [33.63702, 73.01375], [33.63650, 73.01348], [33.63603, 73.01335],
        [33.63590, 73.01341], [33.63582, 73.01340]
    ],
    // // IJP Road
    // [
    //   [33.633, 72.983], [33.633, 73.0], [33.633, 73.017],
    //   [33.633, 73.033], [33.633, 73.05]
    // ]
  ];

  // HTML Template with Fixed Leaflet Initialization
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Islamabad Traffic</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          body { margin:0; padding:0; }
          #map { width:100%; height:100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
          // Wait for DOM to load
          document.addEventListener('DOMContentLoaded', function() {
            // Initialize map
            const map = L.map('map', {
              zoomControl: false,
              attributionControl: false
            }).setView([33.6844, 73.0479], 13);
            
            // Add OSM tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap'
            }).addTo(map);

            // Draw roads
            const roads = ${JSON.stringify(islamabadRoads)}.map(road => 
              L.polyline(road, {color: '#555', weight: 8}).addTo(map)
            );

            const vehicles = {};

            // Vehicle movement function
            function moveVehicle(id) {
              if (!vehicles[id]) return;
              
              const v = vehicles[id];
              const nextIdx = (v.currentIdx + 1) % v.path.length;
              v.marker.setLatLng(v.path[nextIdx]);
              v.currentIdx = nextIdx;
            }

            // Expose functions to React Native
            window.LeafletFunctions = {
              addVehicle: (id, speed) => {
                const roadIdx = Math.floor(Math.random() * ${islamabadRoads.length});
                vehicles[id] = {
                  marker: L.circleMarker(${JSON.stringify(islamabadRoads)}[roadIdx][0], {
                    radius: 8,
                    fillColor: '#ff0000',
                    color: '#000',
                    fillOpacity: 1
                  }).addTo(map),
                  path: ${JSON.stringify(islamabadRoads)}[roadIdx],
                  currentIdx: 0,
                  speed: speed
                };
              },
              moveAllVehicles: () => {
                Object.keys(vehicles).forEach(moveVehicle);
              },
              removeVehicle: (id) => {
                if (vehicles[id]) {
                  map.removeLayer(vehicles[id].marker);
                  delete vehicles[id];
                }
              }
            };
          });
        </script>
      </body>
    </html>
  `;

  // Add vehicle
  const addVehicle = () => {
    const newId = `v_${Date.now()}`;
    setVehicles([...vehicles, { id: newId }]);
    webViewRef.current.injectJavaScript(`
      window.LeafletFunctions.addVehicle('${newId}', ${speed});
    `);
  };

  // Clear vehicles
  const clearVehicles = () => {
    vehicles.forEach(v => {
      webViewRef.current.injectJavaScript(`
        window.LeafletFunctions.removeVehicle('${v.id}');
      `);
    });
    setVehicles([]);
  };

  // Start/stop simulation
  const toggleSimulation = () => {
    if (isSimulating) {
      clearInterval(simulationInterval.current);
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      simulationInterval.current = setInterval(() => {
        webViewRef.current.injectJavaScript(`
          window.LeafletFunctions.moveAllVehicles();
        `);
      }, 1000 - (speed * 8)); // Speed affects update frequency
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onError={(error) => console.log('WebView error:', error)}
        mixedContentMode="always"
        originWhitelist={['*']}
      />
      
      <View style={styles.controls}>
        <Text style={styles.speedText}>Speed: {speed} km/h</Text>
        <Slider
          style={styles.slider}
          value={speed}
          onValueChange={setSpeed}
          minimumValue={10}
          maximumValue={100}
          step={5}
          minimumTrackTintColor="#1fb28a"
          maximumTrackTintColor="#d3d3d3"
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={addVehicle}>
            <Text style={styles.buttonText}>Add Car</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, isSimulating ? styles.stopButton : styles.startButton]}
            onPress={toggleSimulation}
          >
            <Text style={styles.buttonText}>
              {isSimulating ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={clearVehicles}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  speedText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 5
  },
  slider: {
    width: '100%',
    height: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    minWidth: '30%',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  startButton: { backgroundColor: '#4CAF50' },
  stopButton: { backgroundColor: '#F44336' }
});

export default App;