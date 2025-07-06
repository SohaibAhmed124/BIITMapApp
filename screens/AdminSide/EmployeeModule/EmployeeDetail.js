import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert
} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import { BASE_URL } from '../../../Api/BaseConfig';
import { Button, Card, Divider } from 'react-native-paper';
import AdminService from '../../../Api/AdminApiService';

const UserDetail = ({ route, navigation }) => {
  const { userData } = route.params;
  const [user, setUser] = useState(userData);
  const [loading, setLoading] = useState(false);

  const toggleHideEmployee = async () => {
    try {
      setLoading(true);
      await AdminService.HideEmployee(user.employee_id);
      setUser(prev => ({ ...prev, is_hidden: !prev.is_hidden }));
      Alert.alert(
        'Success', 
        `Employee ${!user.is_hidden ? 'hidden' : 'visible'} successfully`
      );
    } catch (error) {
      console.error('Error toggling employee visibility:', error);
      Alert.alert('Error', error.message || 'Failed to update employee status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>Employee Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: user.image
                ? `${BASE_URL}${user.image}`
                : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
            }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
        </View>

        {/* Details Card */}
        <Card style={styles.detailCard}>
          <Card.Content>
            {/* Personal Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <DetailRow icon="mail-outline" label="Email" value={user.email} />
              <DetailRow icon="call-outline" label="Phone" value={user.phone} />
              <DetailRow icon="location-outline" label="Address" value={`${user.address}, ${user.city}`} />
            </View>

            <Divider style={styles.divider} />

            {/* Account Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <DetailRow icon="person-outline" label="Username" value={user.username} />
              <DetailRow icon="calendar-outline" label="Created At" value={new Date(user.created_at).toLocaleDateString()} />
              <DetailRow icon="shield-checkmark-outline" label="Status" value={user.is_deleted ? 'Deleted' : 'Active'} />
            </View>
          </Card.Content>
        </Card>

        {/* Hide/Show Button (only for non-Manager roles) */}
        {user.role !== 'Manager' && (
          <Button
            mode="contained"
            onPress={toggleHideEmployee}
            loading={loading}
            disabled={loading}
            style={[
              styles.toggleButton,
              user.is_hidden ? styles.hiddenButton : styles.visibleButton,
            ]}
            labelStyle={styles.toggleButtonLabel}
            icon={user.is_hidden ? 'eye-off-outline' : 'eye-outline'}
          >
            {user.is_hidden ? 'Hidden' : 'Hide'}
          </Button>
        )}
      </ScrollView>
    </View>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>
      <Icon name={icon} size={20} color="#4a90e2" />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f9fa",
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#4a90e2',
    backgroundColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  detailCard: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e9ecef',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    width: 40,
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#343a40',
    fontWeight: '500',
  },
  toggleButton: {
    borderWidth:3,
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 2,
  },
  visibleButton: {
    backgroundColor: '#a5d6a7', // Light green
    borderColor: '#81c784', // Slightly darker green
  },
  hiddenButton: {
    backgroundColor: '#ef9a9a', // Light red
    borderColor: '#e57373', // Slightly darker red
  },
  toggleButtonLabel: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  // Border styles for buttons
  buttonBorder: {
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default UserDetail;