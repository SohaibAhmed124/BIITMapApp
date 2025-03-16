import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AdminService from '../AdminApiService';


const BranchList = () => {
  const navigation = useNavigation();
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchBranches();
    }, [])
  );

  const fetchBranches = async () => {
    try {
      const response = await AdminService.getAllBranches();
      setBranches(response.branches);
      setFilteredBranches(response.branches);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching branches:', error.message);
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredBranches(branches);
    } else {
      const filtered = branches.filter((branch) =>
        branch.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBranches(filtered);
    }
  };

  const handleEdit = (id,data) => {
    navigation.navigate('UpdateBranch', {branchId: id,  bData: data });
  };

  const handleDelete = (id) => {
    setSelectedBranch(id);
    setShowPopup(true);
  };

  const confirmDelete = async () => {
    setShowPopup(false);
    if (selectedBranch) {
      try {
        await AdminService.deactivateBranch(selectedBranch);
        setBranches((prev) => prev.filter((b) => b.branch_id !== selectedBranch));
        setFilteredBranches((prev) => prev.filter((b) => b.branch_id !== selectedBranch));
        console.log('Branch deleted successfully');
      } catch (error) {
        console.error('Error deleting branch:', error.message);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading branches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={26} color="#fff" />
              </Pressable>
              <Text style={styles.headerText}>Branches</Text>
            </View>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      <FlatList
        data={filteredBranches}
        keyExtractor={(item) => item.branch_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.branchItem}>
            <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('BranchDetail', { bData: item })}>
              <Text style={styles.branchName}>{item.name}</Text>
            </Pressable>
            <Pressable onPress={() => handleEdit(item.branch_id, item)}>
              <Icon name="pencil" size={24} color="#2E86C1" style={styles.icon} />
            </Pressable>
            <Pressable onPress={() => handleDelete(item.branch_id)}>
              <Icon name="trash" size={24} color="#D32F2F" style={styles.icon} />
            </Pressable>
          </View>
        )}
        removeClippedSubviews={false}
      />
      <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddBranch')}>
        <Icon name="add" size={30} color="#fff" />
        <Text style={styles.addButtonText}>Add Branch</Text>
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
            <Text style={styles.popupText}>Do you want to delete this branch?</Text>
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
  branchItem: {
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
  branchName: {
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
export default BranchList;
