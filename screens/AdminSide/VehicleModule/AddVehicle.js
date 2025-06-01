import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import AdminService from '../../../Api/AdminApiService';

const AddVehicle = () => {
  const navigation = useNavigation();
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageOption = async (option) => {
    try {
      let result;
      if (option === 'camera') {
        result = await launchCamera({ mediaType: 'photo', quality: 0.7 });
      } else {
        result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
      }

      if (result && result.assets && result.assets[0]) {
        setImage(result.assets[0]);
      } else {
        Alert.alert('Error', 'No image selected.');
      }
    } catch (error) {
      console.error('Image handling error:', error);
      Alert.alert('Error', 'An error occurred while selecting the image.');
    }
  };

  const handleSubmit = async () => {
    if (!model || !year || image === null) {
      Alert.alert('Error', 'Please fill all fields and provide an image.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('model', model);
    formData.append('year', year);
    formData.append('isActive',true);

    formData.append('image', {
      uri: image.uri,
      name: image.fileName || 'profile.jpg',
      type: image.type || 'image/jpeg',
    });
  

    try {
      const response = await AdminService.createVehicle(formData);
      Alert.alert('Success', response.message || 'Vehicle added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false); // Stop loading animation after API call completes
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                      <Icon name="arrow-back" size={26} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerText}>Add New Vehicle</Text>
                  </View>
      <View style={styles.form}>
        <Text style={styles.inputLabel}>Model:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Vehicle Model"
          placeholderTextColor="#888"
          value={model}
          onChangeText={setModel}
        />
        <Text style={styles.inputLabel}>Year:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Vehicle Year"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={year}
          onChangeText={setYear}
        />
        <View style={styles.imageButtonsContainer}>
          <Pressable
            style={styles.imageButton}
            onPress={() => handleImageOption('camera')}
          >
            <Icon name="camera" size={20} color="#fff" />
            <Text style={styles.imageButtonText}>Capture Image</Text>
          </Pressable>
          <Pressable
            style={styles.imageButton}
            onPress={() => handleImageOption('gallery')}
          >
            <Icon name="image" size={20} color="#fff" />
            <Text style={styles.imageButtonText}>From Gallery</Text>
          </Pressable>
        </View>
        {image && image.uri && (
          <Image
            source={{ uri: image.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        )}
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="checkmark" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: '#F4F7FC',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgb(73, 143, 235)",
    borderRadius: 10,
    paddingHorizontal: 10,
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
  form: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16, color: 'rgb(73, 143, 235)'
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgb(122, 120, 120)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: 'black'
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(73, 143, 235)',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
  },
  imageButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default AddVehicle;
