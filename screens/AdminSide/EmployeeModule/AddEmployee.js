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
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AdminApiService from '../../../Api/AdminApiService';
import { useNavigation } from '@react-navigation/native';


const AddNewUserScreen = () => {
  // Individual state variables for each property
  const navigation = useNavigation();

  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [passwrd, setPasswrd] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [branchName, setBranchName] = useState('');
  const [isManager, setIsManager] = useState(false);
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
    if (
      !userName ||
      !firstName ||
      !lastName ||
      !email ||
      !passwrd ||
      !phone ||
      !city ||
      !branchName ||
      image === null
    ) {
      Alert.alert('Error', 'Please fill all fields and provide an image.');
      return;
    }
  
    setLoading(true);
  
    try {
      const formData = new FormData();
      formData.append('username', userName);
      formData.append('email', email);
      formData.append('password', passwrd);
      formData.append('role', isManager ? 'Manager' : 'Employee');
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('address', address);
      formData.append('city', city);
      formData.append('phone', phone);
      formData.append('branch_name', branchName);
  
      // ✅ Corrected image field name
      formData.append('image', {
        uri: image.uri,
        name: image.fileName || 'profile.jpg',
        type: image.type || 'image/jpeg',
      });
  
      const response = await AdminApiService.createUser(formData);
      Alert.alert('Success', response.message || 'User added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={26} color="#fff" />
              </Pressable>
              <Text style={styles.headerText}>Add New Employee</Text>
            </View>
      <View style={styles.form}>
        <Text style={styles.inputLabel}>Username:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter User Name"
          placeholderTextColor='#888'
          value={userName}
          onChangeText={setUserName}
        />
        <Text style={styles.inputLabel}>FirstName:</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor='#888'
          value={firstName}
          onChangeText={setFirstName}
        />
        <Text style={styles.inputLabel}>LastName:</Text>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor='#888'
          value={lastName}
          onChangeText={setLastName}
        />
        <Text style={styles.inputLabel}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor='#888'
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.inputLabel}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor='#888'
          secureTextEntry={true}
          value={passwrd}
          onChangeText={setPasswrd}
        />
        <Text style={styles.inputLabel}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor='#888'
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <Text style={styles.inputLabel}>City:</Text>
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor='#888'
          value={city}
          onChangeText={setCity}
        />
        <Text style={styles.inputLabel}>Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor='#888'
          value={address}
          onChangeText={setAddress}
        />
        <Text style={styles.inputLabel}>Branch Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Branch Name"
          placeholderTextColor='#888'
          value={branchName}
          onChangeText={setBranchName}
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
    fontSize: 16, color:'rgb(73, 143, 235)'
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgb(122, 120, 120)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: 'black'
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioLabel: {
    marginRight: 15,
    fontSize: 16,
    color: 'rgb(73, 143, 235)'
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  radioText: {
    marginLeft: 5,
    fontSize: 16,
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

export default AddNewUserScreen;
