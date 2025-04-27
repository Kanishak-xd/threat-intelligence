// Backend API configuration
export const API_BASE_URL = 'http://localhost:5050';

// Helper function to build API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`; 