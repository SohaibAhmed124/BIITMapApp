import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AdminService from '../../Api/AdminApiService';

const UpdateBranch = ({ route, navigation }) => {
  const { branchId, bData } = route.params;
  const [branch, setBranch] = useState(bData);
  const [saving, setSaving] = useState(false);


  const handleUpdate = async () => {
    if (!branch.name.trim() || !branch.address.trim() || !branch.phone.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    setSaving(true);
    try {
      await AdminService.updateBranch(branchId, branch);
      Alert.alert('Success', 'Branch updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating branch:', error.message);
      Alert.alert('Error', 'Failed to update branch.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Update Branch</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Branch Name"
          value={branch.name}
          onChangeText={(text) => setBranch({ ...branch, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={branch.address}
          onChangeText={(text) => setBranch({ ...branch, address: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={branch.phone}
          onChangeText={(text) => setBranch({ ...branch, phone: text })}
          keyboardType="phone-pad"
        />
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
    padding: 20
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
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#007BFF',
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

export default UpdateBranch;
