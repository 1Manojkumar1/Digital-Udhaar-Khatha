import axiosInstance from '../utils/axiosInstance';

/**
 * Get all customers for the current shopkeeper (supports query search)
 * @param {string} searchString - Search text (matches name or phone number)
 */
const getAll = async (searchString = '') => {
  const query = searchString ? `?search=${encodeURIComponent(searchString)}` : '';
  const response = await axiosInstance.get(`/api/customers${query}`);
  // Returns { success: true, count, data: [customers] }
  return response.data;
};

/**
 * Get a specific customer by ID
 * @param {string} id - Customer DB ID
 */
const getById = async (id) => {
  const response = await axiosInstance.get(`/api/customers/${id}`);
  // Returns { success: true, data: customer }
  return response.data;
};

/**
 * Create a new customer
 * @param {Object} customerData - { name, phone, email, address, reminderIntervalDays }
 */
const create = async (customerData) => {
  const response = await axiosInstance.post('/api/customers', customerData);
  // Returns { success: true, data: customer }
  return response.data;
};

/**
 * Update an existing customer's details
 * @param {string} id - Customer DB ID
 * @param {Object} customerData - Updates to name, phone, email, address, reminderIntervalDays
 */
const update = async (id, customerData) => {
  const response = await axiosInstance.put(`/api/customers/${id}`, customerData);
  // Returns { success: true, data: customer }
  return response.data;
};

/**
 * Delete a customer and all their ledger transactions
 * @param {string} id - Customer DB ID
 */
const remove = async (id) => {
  const response = await axiosInstance.delete(`/api/customers/${id}`);
  // Returns { success: true, message }
  return response.data;
};

const customerService = {
  getAll,
  getById,
  create,
  update,
  remove,
};

export default customerService;
