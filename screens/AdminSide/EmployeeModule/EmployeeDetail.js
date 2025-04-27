import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable
} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import { API_BASE_URL } from '../../Api/BaseConfig';

const UserDetail = ({ route, navigation }) => {
  const { userData } = route.params;
  const [user, setUser] = useState(userData);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>Employees Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{
            uri: user.image
              ? `${API_BASE_URL}${user.image}`
              : 'https://logodownload.org/wp-content/uploads/2019/07/udemy-logo-5.png'
          }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{user.first_name + ' ' + user.last_name}</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Address: </Text>
            <Text style={styles.userDetail}>{user.address || 'N/A'}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Phone: </Text>
            <Text style={styles.userDetail}>{user.phone || 'N/A'}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.label}>City: </Text>
            <Text style={styles.userDetail}>{user.city || 'N/A'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    padding: 20,
    borderColor: '#2E86C1',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2E86C1',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '90%',
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  userDetail: {
    fontSize: 16,
    color: '#555',
  },
  label: {
    fontWeight: 'bold',
    color: '#2E86C1',
  },
});

export default UserDetail;
