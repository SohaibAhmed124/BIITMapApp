import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { BASE_URL } from '../../Api/BaseConfig';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from 'react-native-modal-datetime-picker';

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

const ThreatLayerScreen = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const webViewRef = useRef(null);
  
  const [formData, setFormData] = useState({
    startTime: new Date().toTimeString().substring(0, 5),
    endTime: new Date(Date.now() + 3600000).toTimeString().substring(0, 5),
    threatLevel: 'Low'
  });

  const generateLeafletHTML = () => {
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
        <script>
          // Initialize map centered on Rawalpindi
          const map = L.map('map').setView([33.6844, 73.0479], 13);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Drawing variables
          const points = [];
          let polygon = null;
          const threatColors = {
            'Low': '#10B981',
            'Medium': '#F59E0B',
            'High': '#EF4444',
            'Critical': '#8B0000'
          };

          // Map click handler
          map.on('click', function(e) {
            const point = [e.latlng.lat, e.latlng.lng];
            points.push(point);
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'POINT_ADDED',
              points: points
            }));
            
            drawPolygon();
          });

          // Draw polygon on map
          function drawPolygon() {
            if (polygon) {
              map.removeLayer(polygon);
            }
            
            if (points.length >= 3) {
              polygon = L.polygon(points, {
                color: threatColors['Low'],
                fillOpacity: 0.4
              }).addTo(map);
            }
          }

          // Clear all points
          function clearPoints() {
            points.length = 0;
            if (polygon) {
              map.removeLayer(polygon);
              polygon = null;
            }
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'POINTS_CLEARED'
            }));
          }

          // Update polygon color
          function updatePolygonColor(threatLevel) {
            if (polygon) {
              polygon.setStyle({
                color: threatColors[threatLevel]
              });
            }
          }

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
      switch (data.type) {
        case 'POINT_ADDED':
          setPoints(data.points);
          break;
        case 'POINTS_CLEARED':
          setPoints([]);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const clearPoints = () => {
    webViewRef.current.injectJavaScript(`
      clearPoints();
      true;
    `);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'threatLevel' && points.length >= 3) {
      webViewRef.current.injectJavaScript(`
        updatePolygonColor('${value}');
        true;
      `);
    }
  };

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true);
  };

  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true);
  };

  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };

  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  const handleStartTimeConfirm = (date) => {
    const timeString = date.toTimeString().substring(0, 5);
    handleInputChange('startTime', timeString);
    hideStartTimePicker();
  };

  const handleEndTimeConfirm = (date) => {
    const timeString = date.toTimeString().substring(0, 5);
    handleInputChange('endTime', timeString);
    hideEndTimePicker();
  };

  const handleSubmit = async () => {
    if (points.length < 3) {
      Alert.alert('Error', 'At least 3 points are required to create a zone');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      Alert.alert('Error', 'Please set both start and end times');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        path: points,
        start_time: formData.startTime,
        end_time: formData.endTime,
        threat_level: formData.threatLevel
      };

      const response = await fetch(`${BASE_URL}/api/location/threat-simulation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Threat zone created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              clearPoints();
              setFormData(prev => ({
                ...prev,
                threatLevel: 'Low'
              }));
            }
          }
        ]);
      } else {
        throw new Error(data.message || "Failed to create zone");
      }
    } catch (error) {
      console.error("Error creating zone:", error);
      Alert.alert('Error', error.message || "Server error. Please try later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New Threat Zone</Text>
        <Text style={styles.headerSubtitle}>Define boundaries by clicking on the map</Text>
      </View>

      {/* WebView with Leaflet Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: generateLeafletHTML() }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleWebViewMessage}
          startInLoadingState={true}
          mixedContentMode="always"
          setSupportMultipleWindows={false}
        />
      </View>

      {/* Form Controls */}
      <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent}>
        <View style={styles.timeInputs}>
          <View style={styles.timeInputContainer}>
            <Text style={styles.label}>Start Time *</Text>
            <TouchableOpacity onPress={showStartTimePicker}>
              <TextInput
                style={styles.input}
                value={formData.startTime}
                editable={false}
                placeholder="HH:MM"
                placeholderTextColor={colors.gray}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeInputContainer}>
            <Text style={styles.label}>End Time *</Text>
            <TouchableOpacity onPress={showEndTimePicker}>
              <TextInput
                style={styles.input}
                value={formData.endTime}
                editable={false}
                placeholder="HH:MM"
                placeholderTextColor={colors.gray}
              />
            </TouchableOpacity>
          </View>
        </View>

        <DateTimePicker
          isVisible={isStartTimePickerVisible}
          mode="time"
          onConfirm={handleStartTimeConfirm}
          onCancel={hideStartTimePicker}
        />

        <DateTimePicker
          isVisible={isEndTimePickerVisible}
          mode="time"
          onConfirm={handleEndTimeConfirm}
          onCancel={hideEndTimePicker}
        />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Threat Level *</Text>
          <View style={styles.threatLevelOptions}>
            {['Low', 'Medium', 'High', 'Critical'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.threatLevelOption,
                  formData.threatLevel === level && styles.threatLevelOptionSelected
                ]}
                onPress={() => handleInputChange('threatLevel', level)}
              >
                <Text style={[
                  styles.threatLevelOptionText,
                  formData.threatLevel === level && styles.threatLevelOptionTextSelected
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.pointsContainer}>
          <View style={styles.pointsHeader}>
            <Text style={styles.label}>Boundary Points ({points.length})</Text>
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={clearPoints}
              disabled={points.length === 0}
            >
              <Icon name="trash" size={16} color={points.length === 0 ? colors.gray : colors.danger} />
              <Text style={[styles.clearButtonText, points.length === 0 && { color: colors.gray }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, points.length < 3 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={points.length < 3 || loading}
        >
          {loading ? (
            <Icon name="spinner" size={16} color={colors.white} style={styles.spinner} />
          ) : (
            <Icon name="save" size={16} color={colors.white} />
          )}
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating...' : 'Create Threat Zone'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  mapContainer: {
    height: "60%",
  },
  webview: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formContent: {
    paddingBottom: 20,
  },
  timeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeInputContainer: {
    width: '48%',
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.darkGray,
    backgroundColor: colors.white,
  },
  threatLevelOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  threatLevelOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
  },
  threatLevelOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  threatLevelOptionText: {
    color: colors.darkGray,
  },
  threatLevelOptionTextSelected: {
    color: colors.primaryDark,
    fontWeight: '500',
  },
  pointsContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearButtonText: {
    color: colors.danger,
    fontSize: 14,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  emptyStateText: {
    marginTop: 8,
    color: colors.darkGray,
    fontSize: 14,
  },
  emptyStateSubtext: {
    color: colors.gray,
    fontSize: 12,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
  spinner: {
    transform: [{ rotate: '0deg' }],
  },
});

export default ThreatLayerScreen;