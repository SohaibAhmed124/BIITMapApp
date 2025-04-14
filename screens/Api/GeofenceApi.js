import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.11:3000/api/admin'; // Replace with your backend URL

const GeofenceService = {
  // Create a new geofence
  createGeofence: async (name, boundary) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/create-geofence`, {
        name,
        boundary,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating geofence:', error);
      throw error;
    }
  },

  // Fetch all geofences
  getAllGeofences: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/list-geofences`);
      return response.data.geofences;
    } catch (error) {
      console.error('Error fetching geofences:', error);
      throw error;
    }
  },

  // Fetch a geofence by name
  getGeofenceByName: async (name) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/single-geofence/${name}`);
      return response.data.geofence;
    } catch (error) {
      console.error('Error fetching geofence by name:', error);
      throw error;
    }
  },

  // Update a geofence
  updateGeofence: async (geoId, name, boundary) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/update-geofence/${geoId}`, {
        name,
        boundary,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating geofence:', error);
      throw error;
    }
  },

  // Deactivate a geofence
  deactivateGeofence: async (geoId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/deactivate-geofence/${geoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating geofence:', error);
      throw error;
    }
  },
};

export default GeofenceService;