import axiosInstance from '../utils/axiosInstance';

/**
 * Get all ledger transactions for a specific customer
 * @param {string} customerId - Customer DB ID
 */
const getByCustomer = async (customerId) => {
  const response = await axiosInstance.get(`/api/transactions/customer/${customerId}`);
  // Returns { success: true, count, data: [transactions] }
  return response.data;
};

/**
 * Create a new ledger transaction entry
 * Supports receipt file uploading via FormData
 * @param {FormData|Object} transactionData - raw object or FormData containing customerId, amount, type, description, date, receipt (file)
 */
const create = async (transactionData) => {
  const isFormData = transactionData instanceof FormData;
  const config = isFormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined;

  const response = await axiosInstance.post('/api/transactions', transactionData, config);
  // Returns { success: true, data: transaction }
  return response.data;
};

/**
 * Update an existing ledger transaction entry details
 * @param {string} id - Transaction DB ID
 * @param {FormData|Object} updateData - Object or FormData updates
 */
const update = async (id, updateData) => {
  const isFormData = updateData instanceof FormData;
  const config = isFormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined;

  const response = await axiosInstance.put(`/api/transactions/${id}`, updateData, config);
  // Returns { success: true, data: transaction }
  return response.data;
};

/**
 * Delete a transaction entry
 * @param {string} id - Transaction DB ID
 */
const remove = async (id) => {
  const response = await axiosInstance.delete(`/api/transactions/${id}`);
  // Returns { success: true, message }
  return response.data;
};

const transactionService = {
  getByCustomer,
  create,
  update,
  remove,
};

export default transactionService;
