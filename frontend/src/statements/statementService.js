import axiosInstance from '../utils/axiosInstance';

/**
 * Fetch and download a PDF transaction statement for a customer
 * @param {string} customerId - Customer DB ID
 * @param {string} startDate - optional ISO date filter start range
 * @param {string} endDate - optional ISO date filter end range
 * @returns {Blob} Binary file blob representing the generated PDF
 */
const downloadPDF = async (customerId, startDate = '', endDate = '') => {
  let query = '';
  const params = [];
  if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
  if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
  if (params.length > 0) {
    query = `?${params.join('&')}`;
  }

  // Request response as a binary blob for streaming
  const response = await axiosInstance.get(
    `/api/statements/customer/${customerId}/pdf${query}`,
    { responseType: 'blob' }
  );

  return response.data;
};

const statementService = {
  downloadPDF,
};

export default statementService;
