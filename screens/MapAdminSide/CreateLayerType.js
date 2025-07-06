// LayerManagementScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Alert , RefreshControl} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import {launchImageLibrary} from 'react-native-image-picker';
import layerApi from '../../Api/LayerApi';
import { ICON_IMG_URL } from '../../Api/BaseConfig';

const LayerManagementScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    imageUri: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [layers, setLayers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('create');
  const [refreshing, setRefreshing] = useState(false);

  const layerTypes = [
    { key: 'location', value: 'Location' },
    { key: 'line', value: 'Line' },
    { key: 'threat', value: 'Threat' },
  ];

  // Fetch layers on component mount
  useEffect(() => {
    fetchLayers();
  }, []);

  const fetchLayers = async () => {
    try {
      setIsLoading(true);
      const data = await layerApi.getAllLayers();
      setLayers(data);
    } catch (error) {
      setMessage({ text: error.message || 'Failed to fetch layers', type: 'error' });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLayers();
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
          if (response.assets && response.assets.length > 0) {
            setFormData({ ...formData, imageData: response.assets[0] });
            setPreviewImage(response.assets[0].uri);
          }
        });
    // launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
    //   if (response.didCancel) {
    //     console.log('User cancelled image picker');
    //   } else if (response.error) {
    //     setMessage({ text: 'ImagePicker Error: ' + response.error, type: 'error' });
    //   } else {
    //     setFormData({ ...formData, imageUri: response.uri });
    //     setPreviewImage(response.uri);
    //   }
    // });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.imageData) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: 'Creating layer...', type: 'info' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);
      
      console.log()

      // Prepare the image file
      const imageFile = {
        uri: formData.imageData.uri,
        type: formData.imageData.type ,
        name: formData.imageData.fileName,
      };
      formDataToSend.append('image', imageFile);

      const createdLayer = await layerApi.createLayer(formDataToSend);
      
      setMessage({ text: `Layer "${createdLayer.name}" created successfully!`, type: 'success' });
      setFormData({ name: '', type: '', description: '', imageUri: null });
      setPreviewImage(null);
      fetchLayers();
    } catch (error) {
      setMessage({
        text: `Error: ${error.message || 'Server error'}`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCreateTab = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Add New Layer</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
        placeholder="Enter layer name"
      />

      <Text style={styles.label}>Type</Text>
      <SelectList
        setSelected={(val) => handleChange('type', val)}
        data={layerTypes}
        save="key"
        placeholder="Select layer type"
        boxStyles={styles.selectListBox}
        inputStyles={styles.selectListInput}
        dropdownStyles={styles.selectListDropdown}
        search={false}
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.description}
        onChangeText={(text) => handleChange('description', text)}
        placeholder="Enter description"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Image (.png - required)</Text>
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>Select Image</Text>
      </TouchableOpacity>

      {previewImage && (
        <Image source={{ uri: previewImage }} style={styles.imagePreview} />
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create Layer</Text>
        )}
      </TouchableOpacity>

      {message.text && (
        <View
          style={[
            styles.message,
            message.type === 'error' && styles.errorMessage,
            message.type === 'success' && styles.successMessage,
          ]}
        >
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      )}
    </View>
  );

  const renderViewTab = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>All Layers</Text>
      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : layers.length === 0 ? (
        <Text style={styles.noLayersText}>No layers found</Text>
      ) : (
        layers.map((layer) => (
          <View key={layer.id} style={styles.layerCard}>
            {layer.image && (
              <Image source={{ uri: `${ICON_IMG_URL}/${layer.image}` }} style={styles.layerImage} />
            )}
            <View style={styles.layerInfo}>
              <Text style={styles.layerName}>{layer.name}</Text>
              <Text style={styles.layerType}>Type: {layer.type}</Text>
              {layer.description && (
                <Text style={styles.layerDescription}>{layer.description}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        selectedTab === 'view' ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        ) : null
      }
    >
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'create' && styles.activeTab]}
          onPress={() => setSelectedTab('create')}
        >
          <Text style={[styles.tabText, selectedTab === 'create' && styles.activeTabText]}>Create Layer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'view' && styles.activeTab]}
          onPress={() => setSelectedTab('view')}
        >
          <Text style={[styles.tabText, selectedTab === 'view' && styles.activeTabText]}>View Layers</Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'create' ? renderCreateTab() : renderViewTab()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontWeight: 'bold',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectListBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectListInput: {
    fontSize: 14,
  },
  selectListDropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: -16,
  },
  imageButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 16,
    borderRadius: 4,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    padding: 12,
    borderRadius: 4,
    marginTop: 16,
  },
  errorMessage: {
    backgroundColor: '#FF3B30',
  },
  successMessage: {
    backgroundColor: '#34C759',
  },
  messageText: {
    color: '#fff',
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  loader: {
    marginVertical: 20,
  },
  noLayersText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  layerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  layerImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  layerInfo: {
    flex: 1,
  },
  layerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  layerType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  layerDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default LayerManagementScreen;