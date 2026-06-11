import { useState, useCallback } from 'react';
import customerService from './customerService';

const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCustomer, setActiveCustomer] = useState(null);

  // Load all customers with search support
  const fetchCustomers = useCallback(async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getAll(searchQuery);
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch customers list');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a customer by ID
  const fetchCustomerById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getById(id);
      if (response.success && response.data) {
        setActiveCustomer(response.data);
        return response.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to load customer profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a customer
  const createCustomer = async (customerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.create(customerData);
      if (response.success && response.data) {
        // Refresh list locally
        setCustomers((prev) => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
        return response.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to create customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update customer profile details
  const updateCustomer = async (id, customerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.update(id, customerData);
      if (response.success && response.data) {
        // Update local records
        setCustomers((prev) =>
          prev.map((c) => (c._id === id ? response.data : c)).sort((a, b) => a.name.localeCompare(b.name))
        );
        if (activeCustomer && activeCustomer._id === id) {
          setActiveCustomer(response.data);
        }
        return response.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to update customer details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove customer
  const deleteCustomer = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.remove(id);
      if (response.success) {
        setCustomers((prev) => prev.filter((c) => c._id !== id));
        if (activeCustomer && activeCustomer._id === id) {
          setActiveCustomer(null);
        }
        return response;
      }
    } catch (err) {
      setError(err.message || 'Failed to delete customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    error,
    activeCustomer,
    fetchCustomers,
    fetchCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setActiveCustomer,
  };
};

export default useCustomers;
