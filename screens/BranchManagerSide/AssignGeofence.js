import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "react-native-modal-datetime-picker";
import api from "../Api/ManagerApi";
import GeofenceService from "../Api/GeofenceApi"; 

const AssignGeofenceScreen = ({ navigation, route }) => {
  const managerId =  1; // Get managerId from navigation or use default
  const [employees, setEmployees] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState("");
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchGeofences();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.getEmployeesByManager(managerId);
      setEmployees(response.employees.map(emp => ({ 
        label: `${emp.first_name} ${emp.last_name}`|| `Employee ${emp.employee_id}`, 
        value: emp.employee_id 
      })));
    } catch (error) {
      console.error("Error fetching employees:", error);
      Alert.alert("Error", "Failed to fetch employees");
    }
  };

  const fetchGeofences = async () => {
    try {
      const response = await GeofenceService.getAllGeofences();
      setGeofences(response.map(geo => ({ 
        label: geo.name || `Geofence ${geo.geo_id}`, 
        value: geo.geo_id
      })));
    } catch (error) {
      console.error("Error fetching geofences:", error);
      Alert.alert("Error", "Failed to fetch geofences");
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const formatTime = (time) => {
    return time.toTimeString().split(' ')[0]; // HH:MM:SS format
  };

  const handleAssignGeofence = async () => {
    if (!selectedEmployee) {
      Alert.alert("Error", "Please select an employee");
      return;
    }
    if (!selectedGeofence) {
      Alert.alert("Error", "Please select a geofence");
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert("Error", "Please select both start and end dates");
      return;
    }
    if (!startTime || !endTime) {
      Alert.alert("Error", "Please select both start and end times");
      return;
    }
    if (!type) {
      Alert.alert("Error", "Please select geofence type");
      return;
    }

    try {
      // Convert single employee ID to array to match API expectation
      const employeeIds = [selectedEmployee];
      
      await api.assignGeofenceToEmployees(
        employeeIds, // Now passing an array
        selectedGeofence,
        startDate,
        endDate,
        startTime,
        endTime,
        type
      );
      
      Alert.alert("Success", "Geofence assigned successfully");
      // navigation.goBack();
    } catch (error) {
      console.error("Error assigning geofence:", error);
      let errorMessage = "Failed to assign geofence";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Assign Geofence</Text>

      {/* Employee Picker - Single select */}
      <Text style={styles.label}>Select Employee</Text>
      <RNPickerSelect
        onValueChange={(value) => setSelectedEmployee(value)}
        items={employees}
        placeholder={{ label: "Select an employee...", value: null }}
        value={selectedEmployee}
        style={pickerSelectStyles}
        useNativeAndroidPickerStyle={false}
      />

      {/* Geofence Picker */}
      <Text style={styles.label}>Select Geofence</Text>
      <RNPickerSelect
        onValueChange={(value) => setSelectedGeofence(value)}
        items={geofences}
        placeholder={{ label: "Select a geofence...", value: null }}
        value={selectedGeofence}
        style={pickerSelectStyles}
        useNativeAndroidPickerStyle={false}
      />

      {/* Start Date */}
      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity 
        onPress={() => setShowStartDatePicker(true)} 
        style={styles.dateInput}
      >
        <Text>{startDate || "Select start date"}</Text>
      </TouchableOpacity>
      <DateTimePicker
        isVisible={showStartDatePicker}
        mode="date"
        onConfirm={(date) => {
          setStartDate(formatDate(date));
          setShowStartDatePicker(false);
        }}
        onCancel={() => setShowStartDatePicker(false)}
      />

      {/* End Date */}
      <Text style={styles.label}>End Date</Text>
      <TouchableOpacity 
        onPress={() => setShowEndDatePicker(true)} 
        style={styles.dateInput}
      >
        <Text>{endDate || "Select end date"}</Text>
      </TouchableOpacity>
      <DateTimePicker
        isVisible={showEndDatePicker}
        mode="date"
        onConfirm={(date) => {
          setEndDate(formatDate(date));
          setShowEndDatePicker(false);
        }}
        onCancel={() => setShowEndDatePicker(false)}
      />

      {/* Start Time */}
      <Text style={styles.label}>Start Time</Text>
      <TouchableOpacity 
        onPress={() => setShowStartTimePicker(true)} 
        style={styles.dateInput}
      >
        <Text>{startTime || "Select start time"}</Text>
      </TouchableOpacity>
      <DateTimePicker
        isVisible={showStartTimePicker}
        mode="time"
        onConfirm={(time) => {
          setStartTime(formatTime(time));
          setShowStartTimePicker(false);
        }}
        onCancel={() => setShowStartTimePicker(false)}
      />

      {/* End Time */}
      <Text style={styles.label}>End Time</Text>
      <TouchableOpacity 
        onPress={() => setShowEndTimePicker(true)} 
        style={styles.dateInput}
      >
        <Text>{endTime || "Select end time"}</Text>
      </TouchableOpacity>
      <DateTimePicker
        isVisible={showEndTimePicker}
        mode="time"
        onConfirm={(time) => {
          setEndTime(formatTime(time));
          setShowEndTimePicker(false);
        }}
        onCancel={() => setShowEndTimePicker(false)}
      />

      {/* Geofence Type */}
      <Text style={styles.label}>Geofence Type</Text>
      <RNPickerSelect
        onValueChange={(value) => setType(value)}
        items={[
          { label: "Authorized (Must be inside)", value: "Authorized" },
          { label: "Restricted (Must be outside)", value: "Restricted" },
        ]}
        placeholder={{ label: "Select type...", value: null }}
        value={type}
        style={pickerSelectStyles}
        useNativeAndroidPickerStyle={false}
        Icon={() => <View style={styles.dropdownIcon} />}
      />

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleAssignGeofence}
      >
        <Text style={styles.submitButtonText}>Assign Geofence</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  dropdownIcon: {
    width: 0,
    height: 0,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    color: '#495057',
    paddingRight: 30,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    color: '#495057',
    paddingRight: 30,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  placeholder: {
    color: '#6c757d',
  },
});

export default AssignGeofenceScreen;

