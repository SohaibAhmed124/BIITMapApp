// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   ActivityIndicator,
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import { SelectList } from 'react-native-dropdown-select-list';
// import AdminApiService from '../../../Api/AdminApiService';
// import { useNavigation } from '@react-navigation/native';


// const AddNewUserScreen = () => {
//   // Individual state variables for each property
//   const navigation = useNavigation();

//   const [userName, setUserName] = useState('');
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [passwrd, setPasswrd] = useState('');
//   const [phone, setPhone] = useState('');
//   const [address, setAddress] = useState('');
//   const [city, setCity] = useState('');
//   const [branchName, setBranchName] = useState('');
//   const [branches, setBranches] = useState(false);
//   const [isManager, setIsManager] = useState(false);
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchBranches();
//   },[]);

//   const fetchBranches = async () => {
//     try {
//       const response = await AdminApiService.getAllBranches();
//       setBranches(response.branches.map(b => ({
//         key: b.branch_id,
//         value: `${b.name} (${b.address})`,
//       })));
//     } catch (error) {
//       console.error("Error fetching Branches:", error);
//       Alert.alert("Error", "Failed to fetch Branches");
//     }
//   };

//   const handleImageOption = async (option) => {
//     try {
//       let result;
//       if (option === 'camera') {
//         result = await launchCamera({ mediaType: 'photo', quality: 0.7 });
//       } else {
//         result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
//       }

//       if (result && result.assets && result.assets[0]) {
//         setImage(result.assets[0]);
//       } else {
//         Alert.alert('Error', 'No image selected.');
//       }
//     } catch (error) {
//       console.error('Image handling error:', error);
//       Alert.alert('Error', 'An error occurred while selecting the image.');
//     }
//   };

//   const handleSubmit = async () => {
//     if (
//       !userName ||
//       !firstName ||
//       !lastName ||
//       !email ||
//       !passwrd ||
//       !phone ||
//       !city ||
//       !branchName ||
//       image === null
//     ) {
//       Alert.alert('Error', 'Please fill all fields and provide an image.');
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append('username', userName);
//       formData.append('email', email);
//       formData.append('password', passwrd);
//       formData.append('role', isManager ? 'Manager' : 'Employee');
//       formData.append('first_name', firstName);
//       formData.append('last_name', lastName);
//       formData.append('address', address);
//       formData.append('city', city);
//       formData.append('phone', phone);
//       formData.append('branch_name', branchName);

//       // ✅ Corrected image field name
//       formData.append('image', {
//         uri: image.uri,
//         name: image.fileName || 'profile.jpg',
//         type: image.type || 'image/jpeg',
//       });

//       const response = await AdminApiService.createUser(formData);
//       Alert.alert('Success', response.message || 'User added successfully');
//       navigation.goBack();
//     } catch (error) {
//       console.error('Submit error:', error);
//       Alert.alert('Error', error.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Header */}
//             <View style={styles.header}>
//               <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
//                 <Icon name="arrow-back" size={26} color="#fff" />
//               </Pressable>
//               <Text style={styles.headerText}>Add New Employee</Text>
//             </View>
//       <View style={styles.form}>
//         <Text style={styles.inputLabel}>Username:</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter User Name"
//           placeholderTextColor='#888'
//           value={userName}
//           onChangeText={setUserName}
//         />
//         <Text style={styles.inputLabel}>FirstName:</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="First Name"
//           placeholderTextColor='#888'
//           value={firstName}
//           onChangeText={setFirstName}
//         />
//         <Text style={styles.inputLabel}>LastName:</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Last Name"
//           placeholderTextColor='#888'
//           value={lastName}
//           onChangeText={setLastName}
//         />
//         <Text style={styles.inputLabel}>Email:</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Email"
//           placeholderTextColor='#888'
//           keyboardType="email-address"
//           value={email}
//           onChangeText={setEmail}
//         />
//         <Text style={styles.inputLabel}>Password:</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Password"
//           placeholderTextColor='#888'
//           secureTextEntry={true}
//           value={passwrd}
//           onChangeText={setPasswrd}
//         />
//         <Text style={styles.inputLabel}>Phone Number:</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Phone"
//           placeholderTextColor='#888'
//           keyboardType="phone-pad"
//           value={phone}
//           onChangeText={setPhone}
//         />
//         <Text style={styles.inputLabel}>City:</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="City"
//           placeholderTextColor='#888'
//           value={city}
//           onChangeText={setCity}
//         />
//         <Text style={styles.inputLabel}>Address:</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Address"
//           placeholderTextColor='#888'
//           value={address}
//           onChangeText={setAddress}
//         />

//                   <Text style={styles.inputLabel}>Select Geofence</Text>
//                   <SelectList
//                     setSelected={setBranchName}
//                     data={branches}
//                     save="value"
//                     placeholder="Select branch"
//                     searchPlaceholder="Search branch..."
//                     boxStyles={styles.dropdownBox}
//                     inputStyles={styles.dropdownInput}
//                     dropdownStyles={styles.dropdownList}
//                     notFoundText="No branch found"
//                   />


//         <View style={styles.radioContainer}>
//           <Text style={styles.radioLabel}>Is Manager?</Text>
//           <Pressable
//             style={styles.radioOption}
//             onPress={() => setIsManager(true)}
//           >
//             <Icon
//               name={isManager ? 'radio-button-on' : 'radio-button-off'}
//               size={20}
//               color="#007BFF"
//             />
//             <Text style={styles.radioText}>Yes</Text>
//           </Pressable>
//           <Pressable
//             style={styles.radioOption}
//             onPress={() => setIsManager(false)}
//           >
//             <Icon
//               name={!isManager ? 'radio-button-on' : 'radio-button-off'}
//               size={20}
//               color="#007BFF"
//             />
//             <Text style={styles.radioText}>No</Text>
//           </Pressable>
//         </View>

//         <View style={styles.imageButtonsContainer}>
//           <Pressable
//             style={styles.imageButton}
//             onPress={() => handleImageOption('camera')}
//           >
//             <Icon name="camera" size={20} color="#fff" />
//             <Text style={styles.imageButtonText}>Capture Image</Text>
//           </Pressable>
//           <Pressable
//             style={styles.imageButton}
//             onPress={() => handleImageOption('gallery')}
//           >
//             <Icon name="image" size={20} color="#fff" />
//             <Text style={styles.imageButtonText}>From Gallery</Text>
//           </Pressable>
//         </View>
//         {image && image.uri && (
//           <Image
//             source={{ uri: image.uri }}
//             style={styles.previewImage}
//             resizeMode="contain"
//           />
//         )}
//         <Pressable style={styles.submitButton} onPress={handleSubmit}>
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <>
//               <Icon name="checkmark" size={20} color="#fff" />
//               <Text style={styles.submitButtonText}>Submit</Text>
//             </>
//           )}
//         </Pressable>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 15,
//     backgroundColor: '#F4F7FC',
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     backgroundColor: "rgb(73, 143, 235)",
//     borderRadius: 10,
//     paddingHorizontal: 10,
//   },
//   backButton: {
//     padding: 5,
//   },
//   headerText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//     marginLeft: 15,
//   },
//   form: {
//     padding: 20,
//   },
//   inputLabel: {
//     fontSize: 16, color:'rgb(73, 143, 235)'
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: 'rgb(122, 120, 120)',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     color: 'black'
//   },
//   dropdownBox: {
//     borderWidth: 1,
//     borderColor: "#e9ecef",
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   dropdownInput: {
//     color: "#495057",
//     fontSize: 15,
//   },
//   dropdownList: {
//     backgroundColor:'#d3def2',
//     borderWidth: 2,
//     borderColor: "#e9ecef",
//     borderRadius: 8,
//     marginTop: 5,
//   },
//   radioContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   radioLabel: {
//     marginRight: 15,
//     fontSize: 16,
//     color: 'rgb(73, 143, 235)'
//   },
//   radioOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   radioText: {
//     marginLeft: 5,
//     fontSize: 16,
//   },
//   imageButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//   },
//   imageButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgb(73, 143, 235)',
//     padding: 10,
//     borderRadius: 8,
//     flex: 0.48,
//   },
//   imageButtonText: {
//     color: '#fff',
//     marginLeft: 10,
//     fontSize: 16,
//   },
//   previewImage: {
//     width: '100%',
//     height: 200,
//     marginBottom: 15,
//     borderRadius: 8,
//   },
//   submitButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#28a745',
//     padding: 15,
//     borderRadius: 8,
//   },
//   submitButtonText: {
//     color: '#fff',
//     marginLeft: 10,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default AddNewUserScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  RadioButton,
  HelperText,
  Divider
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SelectList } from 'react-native-dropdown-select-list';
import AdminApiService from '../../../Api/AdminApiService';
import { useNavigation } from '@react-navigation/native';

const AddNewUserScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    passwrd: '',
    phone: '',
    address: '',
    city: '',
    branchName: '',
    isManager: false,
    image: null
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await AdminApiService.getAllBranches();
      setBranches(response.branches.map(b => ({
        key: b.branch_id,
        value: b.name,
      })));
    } catch (error) {
      console.error("Error fetching Branches:", error);
      Alert.alert("Error", "Failed to fetch Branches");
    }
  };

  const handleImageOption = async (option) => {
    try {
      let result;
      if (option === 'camera') {
        result = await launchCamera({
          mediaType: 'photo',
          quality: 0.7,
          includeBase64: true
        });
      } else {
        result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.7,
          includeBase64: true
        });
      }

      if (result?.assets?.[0]) {
        setFormData({ ...formData, image: result.assets[0] });
        setErrors({ ...errors, image: null });
      } else {
        Alert.alert('Error', 'No image selected.');
      }
    } catch (error) {
      console.error('Image handling error:', error);
      Alert.alert('Error', 'An error occurred while selecting the image.');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['userName', 'firstName', 'lastName', 'email', 'passwrd', 'phone', 'city', 'branchName'];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (!formData.image?.uri) {
      newErrors.image = 'Profile image is required';
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = new FormData();

      // Append all form data with correct field names
      data.append('username', formData.userName);
      data.append('first_name', formData.firstName);
      data.append('last_name', formData.lastName);
      data.append('email', formData.email);
      data.append('password', formData.passwrd);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('city', formData.city);
      data.append('branch_name', formData.branchName);
      data.append('role', formData.isManager ? 'Manager' : 'Employee');

      if (formData.image) {
        data.append('image', {
          uri: formData.image.uri,
          name: formData.image.fileName || 'profile.jpg',
          type: formData.image.type || 'image/jpeg',
        });
      }

      const response = await AdminApiService.createUser(data);
      Alert.alert('Success', response.message || 'User added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  return (
    <View
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Add New Employee</Text>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
        <Card style={styles.formCard} elevation={3}>
          <Card.Content>
            {/* Personal Information Section */}
            <View style={styles.sectionHeader}>
              <Icon name="account-circle" size={24} color="rgb(73, 143, 235)" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <TextInput
              label="Username *"
              mode="outlined"
              value={formData.userName}
              onChangeText={(text) => handleChange('userName', text)}
              style={styles.input}
              error={!!errors.userName}
              left={<TextInput.Icon icon="account" color="rgb(73, 143, 235)" />}
              theme={{ colors: { primary: '#498feb' } }}
            />
            <HelperText type="error" visible={!!errors.userName}>
              {errors.userName}
            </HelperText>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <TextInput
                  label="First Name *"
                  mode="outlined"
                  value={formData.firstName}
                  onChangeText={(text) => handleChange('firstName', text)}
                  error={!!errors.firstName}
                  left={<TextInput.Icon icon="card-account-details" color="#498feb" />}
                  theme={{ colors: { primary: '#498feb' } }}
                />
                <HelperText type="error" visible={!!errors.firstName}>
                  {errors.firstName}
                </HelperText>
              </View>
              <View style={styles.halfInput}>
                <TextInput
                  label="Last Name *"
                  mode="outlined"
                  value={formData.lastName}
                  onChangeText={(text) => handleChange('lastName', text)}
                  error={!!errors.lastName}
                  theme={{ colors: { primary: '#498feb' } }}
                />
                <HelperText type="error" visible={!!errors.lastName}>
                  {errors.lastName}
                </HelperText>
              </View>
            </View>

            <TextInput
              label="Email *"
              mode="outlined"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              error={!!errors.email}
              left={<TextInput.Icon icon="email" color="#498feb" />}
              theme={{ colors: { primary: '#498feb' } }}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              label="Password *"
              mode="outlined"
              value={formData.passwrd}
              onChangeText={(text) => handleChange('passwrd', text)}
              secureTextEntry
              error={!!errors.passwrd}
              left={<TextInput.Icon icon="lock" color="#498feb" />}
              theme={{ colors: { primary: '#498feb' } }}
            />
            <HelperText type="error" visible={!!errors.passwrd}>
              {errors.passwrd}
            </HelperText>

            <Divider style={styles.divider} />

            {/* Contact Information Section */}
            <View style={styles.sectionHeader}>
              <Icon name="contacts" size={24} color="#498feb" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>

            <TextInput
              label="Phone Number *"
              mode="outlined"
              value={formData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              keyboardType="phone-pad"
              error={!!errors.phone}
              left={<TextInput.Icon icon="phone" color="#498feb" />}
              theme={{ colors: { primary: '#498feb' } }}
            />
            <HelperText type="error" visible={!!errors.phone}>
              {errors.phone}
            </HelperText>

            <TextInput
              label="City *"
              mode="outlined"
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
              error={!!errors.city}
              left={<TextInput.Icon icon="map-marker" color="#498feb" />}
              theme={{ colors: { primary: '#498feb' } }}
            />
            <HelperText type="error" visible={!!errors.city}>
              {errors.city}
            </HelperText>

            <TextInput
              label="Address"
              mode="outlined"
              value={formData.address}
              onChangeText={(text) => handleChange('address', text)}
              multiline
              numberOfLines={2}
              left={<TextInput.Icon icon="home" color="#498feb" />}
              theme={{ colors: { primary: '#498feb' } }}
            />

            <Divider style={styles.divider} />

            {/* Employment Information Section */}
            <View style={styles.sectionHeader}>
              <Icon name="briefcase" size={24} color="#498feb" />
              <Text style={styles.sectionTitle}>Employment Information</Text>
            </View>

            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Select Branch *</Text>
              <SelectList
                setSelected={(val) => handleChange('branchName', val)}
                data={branches}
                save="value"
                placeholder="Select branch"
                searchPlaceholder="Search branch..."
                boxStyles={[
                  styles.dropdownBox,
                  errors.branchName && styles.errorBorder
                ]}
                inputStyles={styles.dropdownInput}
                dropdownStyles={styles.dropdownList}
                notFoundText="No branch found"
              />
              {errors.branchName && (
                <HelperText type="error" visible={true}>
                  {errors.branchName}
                </HelperText>
              )}
            </View>

            <View style={styles.radioContainer}>
              <Text style={styles.radioLabel}>Is Manager?</Text>
              <RadioButton.Group
                onValueChange={(value) => handleChange('isManager', value === 'yes')}
                value={formData.isManager ? 'yes' : 'no'}
              >
                <View style={styles.radioOptions}>
                  <View style={styles.radioOption}>
                    <RadioButton.Android
                      value="yes"
                      color="#5D3FD3"
                      uncheckedColor="#5D3FD3"
                    />
                    <Text>Yes</Text>
                  </View>
                  <View style={styles.radioOption}>
                    <RadioButton.Android
                      value="no"
                      color="#5D3FD3"
                      uncheckedColor="#5D3FD3"
                    />
                    <Text>No</Text>
                  </View>
                </View>
              </RadioButton.Group>
            </View>

            <Divider style={styles.divider} />

            {/* Profile Image Section */}
            <View style={styles.sectionHeader}>
              <Icon name="image" size={24} color="#498feb" />
              <Text style={styles.sectionTitle}>Profile Image *</Text>
            </View>

            {errors.image && (
              <HelperText type="error" visible={true}>
                {errors.image}
              </HelperText>
            )}

            <View style={styles.imageButtonsContainer}>
              <Button
                mode="contained"
                icon="camera"
                onPress={() => handleImageOption('camera')}
                style={styles.imageButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Take Photo
              </Button>
              <Button
                mode="contained"
                icon="image"
                onPress={() => handleImageOption('gallery')}
                style={styles.imageButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Choose from Gallery
              </Button>
            </View>

            {formData.image?.uri && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: formData.image.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setFormData({ ...formData, image: null })}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="check"
            >
              {loading ? 'Submitting...' : 'Create Employee'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F8F7FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    paddingVertical: 10,
    paddingHorizontal: 10, // Adjusted padding
    backgroundColor: 'rgb(73, 143, 235)',
    borderRadius: 10, // Added border radius
  },
  backButton: {
    padding: 5, // Hit area for back button
    marginRight: 10, // Space between button and title
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  formCard: {
    margin: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgb(73, 143, 235)',
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#E5E0FF',
    height: 1.5,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 8,
  },
  dropdownBox: {
    borderWidth: 1.5,
    borderColor: '#E5E0FF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  errorBorder: {
    borderColor: '#FF5252',
  },
  dropdownInput: {
    color: '#424242',
    fontSize: 16,
  },
  dropdownList: {
    borderWidth: 1.5,
    borderColor: '#E5E0FF',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  radioContainer: {
    marginBottom: 15,
  },
  radioLabel: {
    fontSize: 14,
    color: 'rgb(73, 143, 235)',
    marginBottom: 10,
  },
  radioOptions: {
    flexDirection: 'row',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageButton: {
    flex: 0.48,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#498feb'
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: 'rgb(76, 189, 91)'
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddNewUserScreen;