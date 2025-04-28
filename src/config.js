// Backend API configuration
const LOCAL_BACKEND_URL = 'http://localhost:5050';
const DEPLOYED_BACKEND_URL = 'https://threat-intelligence-pkiv.onrender.com';

// Set this to true to use local backend, false to use deployed backend
const USE_LOCAL_BACKEND = true;

export const API_BASE_URL = USE_LOCAL_BACKEND ? LOCAL_BACKEND_URL : DEPLOYED_BACKEND_URL;

// Helper function to build API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`; 