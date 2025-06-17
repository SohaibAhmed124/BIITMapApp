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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import api from "../../Api/ManagerApi";
import GeofenceService from "../../Api/GeofenceApi";

const AssignGeofenceScreen = ({ navigation, route }) => {
  const { managerId } = route.params;
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
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={26} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerText}>Assigned Geofences</Text>
            </View>

      <View style={styles.contentContainer}>
        {/* Employees Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Employees</Text>
          <MultipleSelectList
            setSelected={(val) => setSelectedEmployees(val)}
            data={employees}
            save="key"
            placeholder="Select employees"
            searchPlaceholder="Search employees..."
            boxStyles={styles.dropdownBox}
            inputStyles={styles.dropdownInput}
            dropdownStyles={styles.dropdownList}
            badgeStyles={styles.badge}
            badgeTextStyles={styles.badgeText}
            notFoundText="No employees found"
          />
        </View>

        {/* Geofence Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Geofence</Text>
          <SelectList
            setSelected={setSelectedGeofence}
            data={geofences}
            save="key"
            placeholder="Select geofence"
            searchPlaceholder="Search geofences..."
            boxStyles={styles.dropdownBox}
            inputStyles={styles.dropdownInput}
            dropdownStyles={styles.dropdownList}
            notFoundText="No geofences found"
          />
        </View>

        {/* Date and Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Configuration</Text>

          <View style={styles.row}>
            <View style={[styles.column, { marginRight: 10 }]}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                style={styles.dateTimeButton}
              >
                <Icon name="calendar" size={20} color="#6c757d" style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>{startDate || "Select date"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                style={styles.dateTimeButton}
              >
                <Icon name="calendar" size={20} color="#6c757d" style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>{endDate || "Select date"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.column, { marginRight: 10 }]}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(true)}
                style={styles.dateTimeButton}
              >
                <Icon name="clock-outline" size={20} color="#6c757d" style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>{startTime || "Select time"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(true)}
                style={styles.dateTimeButton}
              >
                <Icon name="clock-outline" size={20} color="#6c757d" style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>{endTime || "Select time"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Geofence Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Geofence Type</Text>
          <SelectList
            setSelected={setType}
            data={[
              { key: "Authorized", value: "Authorized (Must be inside)" },
              { key: "Restricted", value: "Restricted (Must be outside)" },
            ]}
            save="key"
            placeholder="Select type"
            searchPlaceholder="Search types..."
            boxStyles={styles.dropdownBox}
            inputStyles={styles.dropdownInput}
            dropdownStyles={styles.dropdownList}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleAssignGeofence}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Assign Geofence</Text>
          <Icon name="send" size={20} color="#fff" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>

      {/* Date/Time Pickers */}
      <DateTimePicker
        isVisible={showStartDatePicker}
        mode="date"
        onConfirm={(date) => {
          setStartDate(formatDate(date));
          setShowStartDatePicker(false);
        }}
        onCancel={() => setShowStartDatePicker(false)}
      />
      <DateTimePicker
        isVisible={showEndDatePicker}
        mode="date"
        onConfirm={(date) => {
          setEndDate(formatDate(date));
          setShowEndDatePicker(false);
        }}
        onCancel={() => setShowEndDatePicker(false)}
      />
      <DateTimePicker
        isVisible={showStartTimePicker}
        mode="time"
        onConfirm={(time) => {
          setStartTime(formatTime(time));
          setShowStartTimePicker(false);
        }}
        onCancel={() => setShowStartTimePicker(false)}
      />
      <DateTimePicker
        isVisible={showEndTimePicker}
        mode="time"
        onConfirm={(time) => {
          setEndTime(formatTime(time));
          setShowEndTimePicker(false);
        }}
        onCancel={() => setShowEndTimePicker(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F4F7FC",
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
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#495057",
    marginBottom: 8,
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownInput: {
    color: "#495057",
    fontSize: 15,
  },
  dropdownList: {
    backgroundColor:'#d3def2',
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderRadius: 8,
    marginTop: 5,
  },
  badge: {
    backgroundColor: "#4dabf7",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 15,
  },
  column: {
    flex: 1,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateTimeText: {
    color: "#495057",
    fontSize: 15,
    marginLeft: 10,
  },
  inputIcon: {
    marginRight: 5,
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(73, 143, 235)",
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: "#4dabf7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 10,
  },
});

export default AssignGeofenceScreen;