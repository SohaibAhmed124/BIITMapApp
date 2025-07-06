import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import DateTimePicker from "react-native-modal-datetime-picker";
import { SelectList } from "react-native-dropdown-select-list";
import layerApi from '../../Api/LayerApi';
import AdminApi from '../../Api/AdminApiService'

const AssignLayerScreen = () => {
  const [users, setUsers] = useState([]);
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    layer_id: '',
    start_time: null,
    end_time: null,
  });
  const [isStartTimePickerVisible, setIsStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Format data for SelectList components
  const userOptions = users.map(user => ({
    key: user.user_id,
    value: `${user.first_name} ${user.last_name} (${user.role})`
  }));

  const layerOptions = layers.map(layer => ({
    key: layer.id,
    value: `${layer.name} (${layer.type})`
  }));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, layersRes] = await Promise.all([
          AdminApi.getAllUsers(),
          layerApi.getAllLayers()
        ]);
        setUsers(usersRes.users);
        setLayers(layersRes);
      } catch (error) {
        setMessage({ text: error.message || 'Failed to load data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showStartTimePicker = () => setIsStartTimePickerVisible(true);
  const hideStartTimePicker = () => setIsStartTimePickerVisible(false);

  const showEndTimePicker = () => setIsEndTimePickerVisible(true);
  const hideEndTimePicker = () => setIsEndTimePickerVisible(false);

  const handleStartTimeConfirm = (date) => {
    setFormData({ ...formData, start_time: date });
    hideStartTimePicker();
  };

  const handleEndTimeConfirm = (date) => {
    setFormData({ ...formData, end_time: date });
    hideEndTimePicker();
  };

  const handleSubmit = async () => {
    if (!formData.user_id || !formData.layer_id) {
      setMessage({ text: 'Please select both user and layer', type: 'error' });
      return;
    }

    // Validate time range if both times are set
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      setMessage({ text: 'End time must be after start time', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: 'Assigning layer...', type: 'info' });

    try {
      const assignmentData = {
        user_id: formData.user_id,
        layer_type_id: formData.layer_id,
        ...(formData.start_time && { start_time: formData.start_time.toISOString() }),
        ...(formData.end_time && { end_time: formData.end_time.toISOString() }),
      };

      const result = await layerApi.assignLayerToUser(assignmentData);
      
      setMessage({ 
        text: `Assigned successfully to ${result.username || 'user'}`,
        type: 'success'
      });
      setFormData({
        user_id: '',
        layer_id: '',
        start_time: null,
        end_time: null,
      });
    } catch (error) {
      setMessage({
        text: `Error: ${error.message || 'Server error'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return 'Not set';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Assign Layer to User</Text>

      {loading && !message.text ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <View style={styles.formContainer}>
          {/* User Selection */}
          <Text style={styles.label}>Select User</Text>
          <SelectList
            setSelected={(value) => setFormData({...formData, user_id: value})}
            data={userOptions}
            placeholder="Select a user"
            searchPlaceholder="Search users..."
            boxStyles={styles.selectBox}
            inputStyles={styles.selectInput}
            dropdownStyles={styles.selectDropdown}
            dropdownTextStyles={styles.dropdownText}
            save="key"
          />

          {/* Layer Selection */}
          <Text style={styles.label}>Select Layer</Text>
          <SelectList
            setSelected={(value) => setFormData({...formData, layer_id: value})}
            data={layerOptions}
            placeholder="Select a layer"
            searchPlaceholder="Search layers..."
            boxStyles={styles.selectBox}
            inputStyles={styles.selectInput}
            dropdownStyles={styles.selectDropdown}
            dropdownTextStyles={styles.dropdownText}
            save="key"
          />

          {/* Start Time */}
          <Text style={styles.label}>Start Time (optional)</Text>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={showStartTimePicker}
          >
            <Text style={styles.timeButtonText}>{formatTime(formData.start_time)}</Text>
          </TouchableOpacity>
          <DateTimePicker
            isVisible={isStartTimePickerVisible}
            mode="time"
            onConfirm={handleStartTimeConfirm}
            onCancel={hideStartTimePicker}
          />

          {/* End Time */}
          <Text style={styles.label}>End Time (optional)</Text>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={showEndTimePicker}
          >
            <Text style={styles.timeButtonText}>{formatTime(formData.end_time)}</Text>
          </TouchableOpacity>
          <DateTimePicker
            isVisible={isEndTimePickerVisible}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={hideEndTimePicker}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Assign Layer</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {message.text && (
        <View style={[
          styles.message,
          message.type === 'error' ? styles.errorMessage : 
          message.type === 'success' ? styles.successMessage : styles.infoMessage
        ]}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  selectInput: {
    fontSize: 14,
  },
  selectDropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: -10,
  },
  dropdownText: {
    fontSize: 14,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  timeButtonText: {
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007AFF',
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
  loader: {
    marginVertical: 40,
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
  infoMessage: {
    backgroundColor: '#007AFF',
  },
  messageText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default AssignLayerScreen;