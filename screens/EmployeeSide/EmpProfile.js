import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useEmployeeContext } from '../../Context/EmployeeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import EmployeeService from '../../Api/EmployeeApi';
import { BASE_URL } from '../../Api/BaseConfig';


const EmployeeProfileScreen = ({ route, navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const {employeeId} = useEmployeeContext();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await EmployeeService.getProfile(employeeId);
        setProfile(data.profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [employeeId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load profile data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{
            uri: profile.image
              ? `${BASE_URL}${profile.image}`
              : 'https://logodownload.org/wp-content/uploads/2019/07/udemy-logo-5.png',
          }}
          style={styles.profileImage}
        />
        <Text style={styles.nameText}>
          {`${profile.first_name} ${profile.last_name}`}
        </Text>

        {/* Detail Rows with Icons */}
        <View style={styles.infoRow}>
          <Icon name="home-outline" size={20} color="#2E86C1" style={styles.icon} />
          <Text style={styles.infoText}>{profile.address || 'No address'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="call-outline" size={20} color="#2E86C1" style={styles.icon} />
          <Text style={styles.infoText}>{profile.phone || 'No phone'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="location-outline" size={20} color="#2E86C1" style={styles.icon} />
          <Text style={styles.infoText}>{profile.city || 'No city'}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF3F9',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#2E86C1',
    marginBottom: 15,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E86C1',
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    width: '100%',
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 1,
  },
  icon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    flexShrink: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#888',
  },
});

export default EmployeeProfileScreen;
