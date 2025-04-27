import axios from "axios";
import { BASE_URL } from "./BaseConfig";

const API_BASE_URL = `${BASE_URL}/api`; // Update with your actual backend URL

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    // Add any default headers here
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error("Response data:", error.response.data);
      console.error("Status code:", error.response.status);
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

const LocationApi = {
    /**
 * Insert user location
 * @param {number} employeeId - ID of the employee
 * @param {Object} locationData - Location data
 * @param {number} locationData.latitude - Latitude
 * @param {number} locationData.longitude - Longitude
 * @param {string} [locationData.timestamp] - Optional timestamp (ISO format)
 * @returns {Promise<Object>} Response data
 */
insertUserLocation: async (employeeId, locationData) => {
    try {
      const response = await apiClient.post(`/location/${employeeId}/add-location`, locationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error inserting user location" };
    }
  },
  
}

export default LocationApi;