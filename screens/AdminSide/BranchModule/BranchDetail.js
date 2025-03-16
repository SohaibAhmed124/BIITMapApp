import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable
} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";

const BranchDetail = ({ route }) => {
  const { bData } = route.params;
  const [branch, setBranch] = useState(bData);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>Branch Details</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.branchName}>{branch.name}</Text>
        <Text style={styles.branchDetail}>
          <Text style={styles.label}>Address: </Text>
          {branch.address || 'N/A'}
        </Text>
        <Text style={styles.branchDetail}>
          <Text style={styles.label}>Phone: </Text>
          {branch.phoneno || 'N/A'}
        </Text>
      </View>
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
    backgroundColor: "#2E86C1",
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
  content: {
    alignItems: 'center',
    padding: 20,
  },
  branchName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2E86C1',
  },
  branchDetail: {
    fontSize: 16,
    color: '#555',
  },
  label: {
    fontWeight: 'bold',
    color: '#2E86C1',
  },
});
export default BranchDetail;
