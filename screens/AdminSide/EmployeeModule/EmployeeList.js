import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AdminApiService from "../AdminApiService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const EmployeeList = () => {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchEmployees();
    }, [])
  );

  const fetchEmployees = async () => {
    try {
      const response = await AdminApiService.getAllEmployees();
      setEmployees(response.employees);
      setFilteredEmployees(response.employees);
      console.log();
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error.message);
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter((employee) =>
        employee.first_name.toLowerCase().includes(text.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
        <Text>Loading Employees...</Text>
      </View>
    );
  }

  const handleDelete = (id) => {
    setShowPopup(true);
    setSelectedUser(id);
  };

  const confirmDelete = async () => {
    setShowPopup(false);
    if (selectedUser) {
      try {
        await AdminApiService.deactivateEmployee(selectedUser);
        setEmployees((prev) => prev.filter((b) => b.employee_id !== selectedUser));
        setFilteredEmployees((prev) => prev.filter((b) => b.employee_id !== selectedUser));
        console.log('Employee deleted successfully');
      } catch (error) {
        console.error('Error deleting Employee:', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>Employees</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Employee"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* Employee List */}
      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.employee_id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.employeeItem}
            onPress={() => navigation.navigate("EmployeeDetail", { userData: item })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.first_name.charAt(0)}</Text>
            </View>
            <Text style={styles.employeeName}>{item.first_name} {item.last_name}</Text>
            <Icon name="pencil" size={24} color="#2E86C1" style={styles.icon} onPress={() => navigation.navigate("UpdateEmployee", { userId: item.employee_id, userData: item })} />
            <Icon name="trash" size={24} color="#D32F2F" style={styles.icon} onPress={() => {handleDelete(item.employee_id)}} />
          </Pressable>
        )}
        removeClippedSubviews={false}
      />

      {/* Add Button */}
      <Pressable style={styles.addButton} onPress={() => navigation.navigate("AddEmployee")}>
        <Icon name="add" size={30} color="#fff" />
        <Text style={styles.addButtonText}>Add Employee</Text>
      </Pressable>
      {/* Popup Modal */}
      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>Do you want to delete this Employee?</Text>
            <View style={styles.popupButtons}>
              <Pressable
                style={[styles.popupButton, styles.confirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.popupButtonText}>Yes</Text>
              </Pressable>
              <Pressable
                style={[styles.popupButton, styles.cancelButton]}
                onPress={() => setShowPopup(false)}
              >
                <Text style={styles.popupButtonText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    padding: 15,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
  },
  employeeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D8BFD8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  employeeName: {
    fontSize: 16,
    flex: 1,
  },
  icon: {
    marginHorizontal: 10,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "rgb(73, 143, 235)",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    margin: 20,
    borderRadius: 30,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  popupText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  popupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  popupButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: 'rgb(73, 143, 235)',
  },
  cancelButton: {
    backgroundColor: '#888',
  },
  popupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EmployeeList;