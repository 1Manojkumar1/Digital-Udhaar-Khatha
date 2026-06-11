import { useState, useCallback } from 'react';
import transactionService from './transactionService';

const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all transactions for a specific customer
  const fetchTransactions = useCallback(async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionService.getByCustomer(customerId);
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new transaction
  const addTransaction = async (transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionService.create(transactionData);
      if (response.success && response.data) {
        setTransactions((prev) => [response.data, ...prev]);
        return response.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to record transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Adjust/Edit an existing transaction details
  const updateTransaction = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionService.update(id, updateData);
      if (response.success && response.data) {
        setTransactions((prev) =>
          prev.map((t) => (t._id === id ? response.data : t))
        );
        return response.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to update transaction entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a transaction entry
  const deleteTransaction = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionService.remove(id);
      if (response.success) {
        setTransactions((prev) => prev.filter((t) => t._id !== id));
        return response;
      }
    } catch (err) {
      setError(err.message || 'Failed to delete transaction entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setTransactions,
  };
};

export default useTransactions;
