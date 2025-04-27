// Backend API configuration
export const API_BASE_URL = 'https://threat-intelligence-pkiv.onrender.com';

// Helper function to build API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`; 