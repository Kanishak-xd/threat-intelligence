// Backend API configuration
export const API_BASE_URL = 'http://localhost:3001';

// Helper function to build API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`; 