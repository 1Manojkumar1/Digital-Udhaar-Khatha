import axiosInstance from '../utils/axiosInstance';

/**
 * Register a new shopkeeper account
 * @param {Object} userData - { name, email, password, phone, shopName, currency }
 */
const register = async (userData) => {
  const response = await axiosInstance.post('/api/auth/register', userData);
  // Returns { success: true, data: { _id, name, email, phone, shopName, currency, token } }
  return response.data;
};

/**
 * Login an existing shopkeeper
 * @param {Object} credentials - { email, password }
 */
const login = async (credentials) => {
  const response = await axiosInstance.post('/api/auth/login', credentials);
  // Returns { success: true, data: { _id, name, email, phone, shopName, currency, token } }
  return response.data;
};

/**
 * Fetch the active shopkeeper's profile details
 */
const getProfile = async () => {
  const response = await axiosInstance.get('/api/auth/profile');
  // Returns { success: true, data: user }
  return response.data;
};

const authService = {
  register,
  login,
  getProfile,
};

export default authService;
