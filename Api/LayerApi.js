// api/layerApi.js
import axios from 'axios';
import { BASE_URL } from './BaseConfig';

const API_BASE_URL = `${BASE_URL}/api/layers`;

const layerApi = {
  // Create a new layer (location, line, or threat)
  createLayer: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Get all layers
  getAllLayers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Get layers by type: location | line | threat
  getLayersByType: async (type) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/type/${type}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Assign layer to user
  assignLayerToUser: async (assignmentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/assign`, assignmentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Get all user-layer assignments
  getAllUserLayerAssignments: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assignments`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  
  // Get all user-layer assignments
  getPublicLayers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Layertype/public`)
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Get layer by ID
  getLayerById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Get all layers assigned to a specific user
  getUserAssignedLayers: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}/layers`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
};

export default layerApi;
