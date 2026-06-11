import axiosInstance from '../utils/axiosInstance';

const getAll = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  const qs = query.toString();
  const response = await axiosInstance.get(`/api/reminders${qs ? `?${qs}` : ''}`);
  return response.data;
};

const getByCustomer = async (customerId) => {
  const response = await axiosInstance.get(`/api/reminders/customer/${customerId}`);
  return response.data;
};

const create = async (data) => {
  const response = await axiosInstance.post('/api/reminders', data);
  return response.data;
};

const sendNow = async (id) => {
  const response = await axiosInstance.post(`/api/reminders/${id}/send-now`);
  return response.data;
};

const remove = async (id) => {
  const response = await axiosInstance.delete(`/api/reminders/${id}`);
  return response.data;
};

const batchSchedule = async (data) => {
  const response = await axiosInstance.post('/api/reminders/batch', data);
  return response.data;
};

export default {
  getAll,
  getByCustomer,
  create,
  sendNow,
  remove,
  batchSchedule,
};
