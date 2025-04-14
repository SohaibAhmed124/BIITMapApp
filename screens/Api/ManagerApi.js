import axios from "axios";

const API_BASE_URL = "http://192.168.1.11:3000/api"; // Update with your actual backend URL

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

const api = {
  /**
   * Assign geofence to multiple employees
   * @param {number[]} employeeIds - Array of employee IDs
   * @param {number} geoId - Geofence ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {string} startTime - Start time (HH:MM:SS)
   * @param {string} endTime - End time (HH:MM:SS)
   * @param {string} type - Geofence type
   * @returns {Promise<Object>} Response data
   */
  assignGeofenceToEmployees: async (employeeIds, geoId, startDate, endDate, startTime, endTime, type) => {
    return apiClient.post("/manager/assign-geofence", {
      employeeIds,
      geoId,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      type,
    });
  },

  /**
   * Assign vehicle to an employee
   * @param {number} employeeId - Employee ID
   * @param {number} vehicleId - Vehicle ID
   * @returns {Promise<Object>} Response data
   */
  assignVehicleToEmployee: async (employeeId, vehicleId) => {
    return apiClient.post("/manager/assign-vehicle", { employeeId, vehicleId });
  },

  /**
   * Get single employee's location
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Object>} Employee location data
   */
  getEmployeeLocation: async (employeeId) => {
    return apiClient.get(`/manager/employee/${employeeId}/location`);
  },

  /**
   * Get all violations for a manager
   * @param {number} managerId - Manager ID
   * @returns {Promise<Object[]>} Array of violations
   */
  getManagerViolations: async (managerId) => {
    return apiClient.get(`/manager/${managerId}/view-violations`);
  },

  /**
   * Get employees under a manager
   * @param {number} managerId - Manager ID
   * @returns {Promise<Object[]>} Array of employees
   */
  getEmployeesByManager: async (managerId) => {
    return apiClient.get(`/manager/${managerId}/employees`);
  },

  /**
   * Get all employees' locations under a manager
   * @param {number} managerId - Manager ID
   * @returns {Promise<Object[]>} Array of employee locations
   */
  getEmployeesLocationsByManager: async (managerId) => {
    return apiClient.get(`/manager/${managerId}/employees/locations`);
  },

  /**
   * Get filtered violations
   * @param {Object} filters - Filter criteria
   * @param {number} filters.managerId - Manager ID
   * @param {string} [filters.startDate] - Start date (YYYY-MM-DD)
   * @param {string} [filters.endDate] - End date (YYYY-MM-DD)
   * @param {number} [filters.employeeId] - Employee ID
   * @param {number} [filters.geoId] - Geofence ID
   * @returns {Promise<Object[]>} Array of filtered violations
   */
  getFilteredViolations: async ({ managerId, startDate, endDate, employeeId, geoId }) => {
    return apiClient.get("/manager/violations-by-filters", {
      params: {
        managerId,
        start_date: startDate,
        end_date: endDate,
        employee_id: employeeId,
        geo_id: geoId,
      },
    });
  },

  /**
   * Get violations for a group of employees
   * @param {number[]} employeeIds - Array of employee IDs
   * @returns {Promise<Object[]>} Array of violations
   */
  getViolationsForGroup: async (employeeIds) => {
    return apiClient.post("/manager/violations-for-group", { employeeIds });
  },

  /**
   * Get violations by employee ID
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Object[]>} Array of violations
   */
  getViolationsByEmployee: async (employeeId) => {
    return apiClient.get(`/manager/violations-by-employee/${employeeId}`);
  },

  /**
   * Get all assigned geofences with optional filters
   * @param {Object} [filters] - Optional filters
   * @param {number} [filters.employeeId] - Employee ID filter
   * @param {number} [filters.geoId] - Geofence ID filter
   * @returns {Promise<Object[]>} Array of assigned geofences
   */
  getAssignedGeofences: async (filters = {}) => {
    return apiClient.get("/manager/assigned-geofences", {
      params: filters,
    });
  },

  /**
   * Get all assigned vehicles with optional filters
   * @param {Object} [filters] - Optional filters
   * @param {number} [filters.employeeId] - Employee ID filter
   * @param {number} [filters.vehicleId] - Vehicle ID filter
   * @returns {Promise<Object[]>} Array of assigned vehicles
   */
  getAssignedVehicles: async (filters = {}) => {
    return apiClient.get("/manager/assigned-vehicles", {
      params: filters,
    });
  },

  // Add more methods as needed...
};

export default api;