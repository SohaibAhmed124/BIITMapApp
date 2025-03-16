import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AdminService from '../AdminApiService';

const AddBranch = ({ navigation }) => {
  const [branch, setBranch] = useState({ name: '', address: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!branch.name.trim() || !branch.address.trim() || !branch.phone.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    setSaving(true);
    try {
      await AdminService.createBranch(branch);
      Alert.alert('Success', 'Branch added successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding branch:', error.message);
      Alert.alert('Error', 'Failed to add branch.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>Add New Branch</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.inputLabel}>Branch Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Branch Name"
          value={branch.name}
          onChangeText={(text) => setBranch({ ...branch, name: text })}
        />
        <Text style={styles.inputLabel}>Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={branch.address}
          onChangeText={(text) => setBranch({ ...branch, address: text })}
        />
        <Text style={styles.inputLabel}>Phone No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={branch.phone}
          onChangeText={(text) => setBranch({ ...branch, phone: text })}
          keyboardType="phone-pad"
        />
      </View>

      <Pressable style={styles.submitButton} onPress={handleAdd}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default AddBranch;
