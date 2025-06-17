import React, { useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import Icon from "react-native-vector-icons/Ionicons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MAP_URL } from "../../../Api/BaseConfig";
import { GeofenceMap } from "../../CustomComponents/GeofenceMap";

const GeofenceDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { geoData } = route.params;
  const webViewRef = useRef(null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>Geofence Detail</Text>
      </View>

      {/* Map View */}
      <WebView
        ref={webViewRef}
        source={{html:GeofenceMap(MAP_URL)}}
        style={styles.mapView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={() => {
            if (webViewRef.current) {
              const script = `window.displayGeofence(${JSON.stringify(geoData.boundary)});`;
              webViewRef.current.injectJavaScript(script);
            }
          }}
      />
    {console.log(geoData.created_at)}
      {/* Geofence Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.geofenceName}>{geoData.name}</Text>
        <Text style={styles.creationDate}>
  Created on: <Text style={styles.date}>{new Date(geoData.created_at).toISOString().split('T')[0]}</Text>
</Text>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F4F7FC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgb(73, 143, 235)",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom:10
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
  mapView: {
    flex: 1,
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  infoContainer: {
    marginTop:10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
  },
  geofenceName: {
    fontSize: 18,
    fontWeight: "bold",
    color:'rgb(73, 143, 235)'
  },
  creationDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },creationDate: {
    fontSize: 16,
    color: "#000",
  },
  date: {
    fontWeight: "bold",
    color: "rgb(73, 143, 235)",
  },
});

export default GeofenceDetail;
