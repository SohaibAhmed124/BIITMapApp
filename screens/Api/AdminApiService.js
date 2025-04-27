import axios from 'axios';
import { BASE_URL } from './BaseConfig';

const API_BASE_URL = `${BASE_URL}/api`; // Replace with actual backend URL
console.log(API_BASE_URL);

const AdminService = {
  // Create a new user
  // createUser: async (userData) => {
  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/admin/create-user`, userData);
  //     return response.data;
  //   } catch (error) {
  //     throw error.response?.data || { message: 'Error creating user' };
  //   }
  // },
  createUser: async (formData) => {
    const response = await axios.post(`${API_BASE_URL}/admin/create-user`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/list-users`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching users' };
    }
  },

  // Update a user
  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/update-user/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating user' };
    }
  },

  // Deactivate (soft delete) a user
  deactivateUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/deactivate-user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deactivating user' };
    }
  },
  // Vehicle Management
  createVehicle: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/create-vehicle`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error creating vehicle' };
    }
  },

  getAllVehicles: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/list-vehicles`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching vehicles' };
    }
  },

  updateVehicle: async (vehicleId, vehicleData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/update-vehicle/${vehicleId}`, vehicleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating vehicle' };
    }
  },

  deactivateVehicle: async (vehicleId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/admin/deactivate-vehicle/${vehicleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deactivating vehicle' };
    }
  },
   // Create a new branch
   createBranch: async (branchData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/create-branch`, branchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error creating branch" };
    }
  },

  // Get all branches
  getAllBranches: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/list-branches`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching branches" };
    }
  },

  // Update a branch
  updateBranch: async (branchId, branchData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/update-branch/${branchId}`, branchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error updating branch" };
    }
  },

  // Deactivate (soft delete) a branch
  deactivateBranch: async (branchId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/admin/deactivate-branch/${branchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error deactivating branch" };
    }
  },

  // Get all employees
  getAllEmployees: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/list-employees`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching employees" };
    }
  },

  // Update employee details
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/update-employee/${employeeId}`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error updating employee" };
    }
  },

  // Deactivate (soft delete) an employee
  deactivateEmployee: async (employeeId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/admin/deactivate-employee/${employeeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error deactivating employee" };
    }
  },
};

export default AdminService;
