import axios from 'axios';
import { BASE_URL } from './BaseConfig';

const API_BASE_URL = `${BASE_URL}/api`; // Replace with your backend URL

const EmployeeService = {
  // Fetch employee profile by ID
  getProfile: async (employeeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employee/my-profile/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Fetch geofences assigned to an employee
  getAssignedGeofences: async (employeeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employee/my-geofences/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned geofences:', error);
      throw error;
    }
  },

  // Fetch vehicles assigned to an employee
  getAssignedVehicles: async (employeeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employee/my-vehicles/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned vehicles:', error);
      throw error;
    }
  },
};

export default EmployeeService;
