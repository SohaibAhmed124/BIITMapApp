import React from 'react';
import { WebView } from 'react-native-webview';
import { Platform, View } from 'react-native';

const TestingMap = () => {
  const htmlFile = Platform.OS === 'android'
    ? { uri: 'file:///android_asset/leaflet.html' }
    : require('../assets/leaflet.html');

  return (
    <View style={{width:'auto', height:800, flex:1, borderRadius:7, borderWidth:4, borderColor:'blue', overflow:'hidden'}}>
      <WebView
        source={htmlFile}
        style={{borderwidth:3, borderColor:'red'}}
        onMessage={(event) => {
          const coordinates = JSON.parse(event.nativeEvent.data);
          console.log('Clicked Coordinates:', coordinates);
        }}
      />
    </View>
  );
};

export default TestingMap;