import React, { useState} from 'react';
import { View, Text, TextInput, Image, StyleSheet, Pressable, Alert, TouchableOpacity} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AdminApiService from '../AdminApiService'; // Assuming your API functions are correctly implemented
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const UpdateUser = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, userData } = route.params;

  const [firstName, setFirstName] = useState(userData.first_name);
  const [lastName, setLastName] = useState(userData.last_name);
  const [phone, setPhone] = useState(userData.phone);
  const [city, setCity] = useState(userData.city);
  const [address, setAddress] = useState(userData.address);
  const [image, setImage] = useState(null);
  const [updateImg, setUpdateImage] = useState(null);
  const [isManager, setIsManager] = useState(false);

  
  const handleImagePicker = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        setUpdateImage(response.assets[0]);
        setImage(response.assets[0].uri);
      }
    });
  };

  const handleUpdate = async () => {
    const updatedUser = {
      firstName,
      lastName,
      phone,
      city,
      address,
      role:(isManager?"Manager":"Employee")
    };

    try {
      var response = await AdminApiService.updateEmployee(userId, updatedUser);
      Alert.alert('Success', response.message || 'User updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Update User</Text>
      </View>
      <View style={styles.formContainer}>
        <Pressable onPress={handleImagePicker} style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Select Image</Text>
          )}
        </Pressable>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
        />
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
        />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
        />
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="City"
        />
        <View style={styles.radioContainer}>
          <Text style={styles.radioLabel}>Is Manager?</Text>
          <Pressable
            style={styles.radioOption}
            onPress={() => setIsManager(true)}
          >
            <Icon
              name={isManager ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color="#007BFF"
            />
            <Text style={styles.radioText}>Yes</Text>
          </Pressable>
          <Pressable
            style={styles.radioOption}
            onPress={() => setIsManager(false)}
          >
            <Icon
              name={!isManager ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color="#007BFF"
            />
            <Text style={styles.radioText}>No</Text>
          </Pressable>
        </View>
        {/* Updated button style for consistency with AddUser */}
        <Pressable style={styles.submitButton} onPress={handleUpdate}>
          <Icon name="checkmark" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Update</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#007BFF',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding:20
  },
  input: {
    height: 40,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
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
  image: {
    width: 120,
    height: 120,
    borderRadius: 70,
    marginTop:10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor:'#007BFF',
    alignSelf: 'center',
  },
  imagePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 50,
    height: 100,
    width: 100,
    marginBottom: 20,
    alignSelf: 'center',
  },
  imagePlaceholder: {
    color: '#888',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioLabel: {
    marginRight: 15,
    fontSize: 16
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  radioText: {
    marginLeft: 5,
    fontSize: 16,
  }
});

export default UpdateUser;
