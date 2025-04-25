import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import { SelectList, MultipleSelectList } from "react-native-dropdown-select-list";
import Icon from 'react-native-vector-icons/Ionicons';
import api from "../Api/ManagerApi";
import GeofenceService from "../Api/GeofenceApi";

const AssignGeofenceScreen = ({ navigation }) => {
  const managerId = 1;
  const [employees, setEmployees] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
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
        key: emp.employee_id,
        value: `${emp.first_name} ${emp.last_name}` || `Employee ${emp.employee_id}`,
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
        key: geo.geo_id,
        value: geo.name || `Geofence ${geo.geo_id}`,
      })));
    } catch (error) {
      console.error("Error fetching geofences:", error);
      Alert.alert("Error", "Failed to fetch geofences");
    }
  };

  const formatDate = (date) => date.toISOString().split('T')[0];
  const formatTime = (time) => time.toTimeString().split(' ')[0];

  const handleAssignGeofence = async () => {
    if (selectedEmployees.length === 0) {
      Alert.alert("Error", "Please select at least one employee");
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
    
    console.log(selectedEmployees)
    try {
      await api.assignGeofenceToEmployees(
        selectedEmployees,
        selectedGeofence,
        startDate,
        endDate,
        startTime,
        endTime,
        type
      );

      Alert.alert("Success", "Geofence assigned successfully");
    } catch (error) {
      console.error("Error assigning geofence:", error);
      const errorMessage = error.response?.data?.message || "Failed to assign geofence";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerText}>Assign Geofence</Text>
            </View>

      <Text style={styles.label}>Select Employees</Text>
      <MultipleSelectList
        setSelected={(val) => {
          setSelectedEmployees(val)
          console.log(selectedEmployees)
        }}
        data={employees}
        save="key"
        placeholder="Select employees"
        boxStyles={styles.dropdown}
        inputStyles={styles.inputText}
        badgeStyles={styles.badge}
        badgeTextStyles={styles.badgeText}
      />

      <Text style={styles.label}>Select Geofence</Text>
      <SelectList
        setSelected={setSelectedGeofence}
        data={geofences}
        save="key"
        placeholder="Select geofence"
        boxStyles={styles.dropdown}
        inputStyles={styles.inputText}
      />

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

      <Text style={styles.label}>Geofence Type</Text>
      <SelectList
        setSelected={setType}
        data={[
          { key: "Authorized", value: "Authorized (Must be inside)" },
          { key: "Restricted", value: "Restricted (Must be outside)" },
        ]}
        save="key"
        placeholder="Select type"
        boxStyles={styles.dropdown}
        inputStyles={styles.inputText}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleAssignGeofence}>
        <Text style={styles.submitButtonText}>Assign Geofence</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2E86C1',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#495057",
  },
  dropdown: {
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  inputText: {
    color: "#495057",
  },
  badge: {
    backgroundColor: "#007bff",
  },
  badgeText: {
    color: "#fff",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AssignGeofenceScreen;
