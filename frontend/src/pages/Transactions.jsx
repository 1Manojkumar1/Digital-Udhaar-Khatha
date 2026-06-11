import React, { useEffect, useState } from 'react';
import { CreditCard, User, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import useAuth from '../auth/useAuth';
import useCustomers from '../customers/useCustomers';
import useTransactions from '../transactions/useTransactions';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionForm from '../components/transactions/TransactionForm';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';

const Transactions = () => {
  const { user } = useAuth();
  const { customers, loading: customersLoading, fetchCustomers } = useCustomers();
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    fetchTransactions,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Load transactions automatically when a customer is chosen
  useEffect(() => {
    if (selectedCustomerId) {
      fetchTransactions(selectedCustomerId);
    }
  }, [selectedCustomerId, fetchTransactions]);

  const handleTransactionEditTrigger = (tx) => {
    setEditingTransaction(tx);
    setTransactionModalOpen(true);
  };

  const handleTransactionDeleteTrigger = async (txId) => {
    if (window.confirm('Are you sure you want to delete this ledger entry? The customer outstanding balance will be automatically adjusted.')) {
      try {
        await deleteTransaction(txId);
        if (selectedCustomerId) {
          fetchTransactions(selectedCustomerId);
        }
      } catch (err) {
        console.error('Failed to delete transaction:', err);
      }
    }
  };

  const handleTransactionSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, formData);
        setTransactionModalOpen(false);
        if (selectedCustomerId) {
          fetchTransactions(selectedCustomerId);
        }
      }
    } catch (err) {
      console.error('Transaction update failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencyCode = user?.currency || 'INR';

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-xl font-bold text-slate-800 font-display">Ledger Entries</h1>
        <p className="text-xs text-slate-400 font-semibold">Select a customer to view, edit, or adjust recorded credit logs and payment histories.</p>
      </div>

      {/* 2. Customer dropdown selector bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1 md:max-w-xs w-full">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">
            Select Customer Ledger
          </label>
          
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              disabled={customersLoading || transactionsLoading}
              className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans appearance-none"
            >
              <option value="">-- Select from directory --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {transactionsLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
            <span>Syncing ledger log...</span>
          </div>
        )}
      </div>

      {/* 3. Transaction Listings Table */}
      {transactionsError && (
        <div className="p-3.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{transactionsError}</span>
        </div>
      )}

      {selectedCustomerId ? (
        transactionsLoading && transactions.length === 0 ? (
          <Loader message="Loading account logs..." />
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-display font-semibold text-slate-800 text-sm">Account Ledger History</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{transactions.length} entries</span>
            </div>

            <TransactionTable
              transactions={transactions}
              currency={currencyCode}
              onEdit={handleTransactionEditTrigger}
              onDelete={handleTransactionDeleteTrigger}
            />
          </div>
        )
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-3">
          <CreditCard className="w-12 h-12 text-slate-200" />
          <h4 className="font-display text-slate-700 font-semibold text-sm">Select a customer ledger</h4>
          <p className="text-xs text-slate-400 max-w-sm">Choose any customer from the directory above to display their credit and debit transaction history logs.</p>
        </div>
      )}

      {/* Edit Transaction Modal Drawer */}
      <Modal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        title="Edit Ledger Entry Details"
        size="md"
      >
        <TransactionForm
          initialData={editingTransaction}
          onSubmit={handleTransactionSubmit}
          onCancel={() => setTransactionModalOpen(false)}
          loading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Transactions;
