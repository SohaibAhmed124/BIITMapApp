// api/mapLocationApi.js
import axios from 'axios';
import { BASE_URL } from './BaseConfig';

const API_BASE_URL = `${BASE_URL}/api/location`;

const mapLocationApi = {
  // Add a new location
  addLocation: async (locationData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/add-map-location`, locationData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Get all locations
  getAllLocations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/map-locations`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Get a location by ID
  getLocationById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/map-locations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

    // Get a map location by name
  getMapLocation: async (name) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search-location?location=${name}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // // Update a location
  // updateLocation: async (id, locationData) => {
  //   try {
  //     const response = await axios.put(`${API_BASE_URL}/map-locations/${id}`, locationData);
  //     return response.data;
  //   } catch (error) {
  //     throw error.response ? error.response.data : error.message;
  //   }
  // },

  // // Delete a location
  // deleteLocation: async (id) => {
  //   try {
  //     const response = await axios.delete(`${API_BASE_URL}/map-locations/${id}`);
  //     return response.data;
  //   } catch (error) {
  //     throw error.response ? error.response.data : error.message;
  //   }
  // }
};

export default mapLocationApi;
