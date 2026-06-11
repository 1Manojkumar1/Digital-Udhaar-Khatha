/**
 * CustomerDetails — Individual Customer Ledger Page
 *
 * The most feature-rich page, showing everything for a single customer:
 *   1. Back button + page header
 *   2. CustomerProfile card (name, contact, balance, reminder config)
 *   3. Reminder controls (Send Preview test email + Schedule button)
 *   4. Transaction timeline (CustomerTransactions) with edit/delete
 *   5. Give/Take action buttons to add new transactions
 *   6. PDF export button (downloads statement via backend)
 *   7. Delete profile button (with confirmation)
 *
 * All mutations (add/edit/delete transaction, delete customer, test email,
 * export PDF) reload the ledger data to keep the view in sync.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download, MessageSquare, AlertCircle, Trash2, ShieldAlert, Send, CheckCircle2, Loader2 } from 'lucide-react';
import useAuth from '../auth/useAuth';
import useCustomers from '../customers/useCustomers';
import useTransactions from '../transactions/useTransactions';
import CustomerProfile from '../components/customers/CustomerProfile';
import CustomerTransactions from '../components/customers/CustomerTransactions';
import ReminderButton from '../components/customers/ReminderButton';
import TransactionForm from '../components/transactions/TransactionForm';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import statementService from '../statements/statementService';
import pdfDownload from '../utils/pdfDownload';
import axiosInstance from '../utils/axiosInstance';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    activeCustomer,
    loading: customerLoading,
    error: customerError,
    fetchCustomerById,
    deleteCustomer,
  } = useCustomers();

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionFormType, setTransactionFormType] = useState('give'); // 'give' (gave credit) or 'take' (got payment)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Load customer profile and transaction ledger
  const loadLedgerData = useCallback(async () => {
    try {
      await fetchCustomerById(id);
      await fetchTransactions(id);
    } catch (err) {
      console.error('Failed to load customer details or ledger:', err);
    }
  }, [id, fetchCustomerById, fetchTransactions]);

  useEffect(() => {
    loadLedgerData();
  }, [loadLedgerData]);

  const handleOpenAddTransaction = (type) => {
    setTransactionFormType(type);
    setEditingTransaction(null);
    setTransactionModalOpen(true);
  };

  const handleOpenEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setTransactionFormType(tx.type);
    setTransactionModalOpen(true);
  };

  const handleTransactionSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, formData);
      } else {
        // Automatically inject customerId into formData payload
        formData.append('customerId', id);
        await addTransaction(formData);
      }
      setTransactionModalOpen(false);
      
      // Auto-sync customer net balance and transaction list
      loadLedgerData();
    } catch (err) {
      console.error('Transaction write failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransactionDelete = async (txId) => {
    if (window.confirm('Are you sure you want to delete this ledger entry? The customer outstanding balance will be automatically adjusted.')) {
      try {
        await deleteTransaction(txId);
        loadLedgerData();
      } catch (err) {
        console.error('Failed to delete transaction:', err);
      }
    }
  };

  const handleExportPDF = async () => {
    if (!activeCustomer) return;
    setPdfGenerating(true);
    try {
      const sanitizedCustomerName = activeCustomer.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const blob = await statementService.downloadPDF(id);
      pdfDownload(blob, `ledger_statement_${sanitizedCustomerName}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert(err.message || 'Failed to download statement PDF.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleTestEmail = async () => {
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await axiosInstance.post('/api/reminders/send-test', { customerId: id });
      setTestResult(res.data.success ? 'success' : 'error');
    } catch (err) {
      setTestResult('error');
      const msg = err.response?.data?.error || err.message;
      alert(`Email Error: ${msg}`);
    } finally {
      setTestSending(false);
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const handleDeleteCustomerProfile = async () => {
    if (window.confirm(`CRITICAL WARNING: Are you absolutely sure you want to delete the customer "${activeCustomer?.name}"?\nThis will permanently destroy their profile and erase their entire credit/debit transaction history from the database.`)) {
      try {
        await deleteCustomer(id);
        navigate('/customers');
      } catch (err) {
        console.error('Profile deletion failed:', err);
      }
    }
  };

  const currencyCode = user?.currency || 'INR';
  const shopkeeperName = user?.shopName || 'our store';

  if ((customerLoading || transactionsLoading) && !activeCustomer) {
    return <Loader message="Opening customer ledger book..." />;
  }

  if (customerError) {
    return (
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500" />
        <h3 className="font-display font-bold text-slate-800 text-lg">Failed to open ledger</h3>
        <p className="text-xs text-slate-500 max-w-md">{customerError}</p>
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to directory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-display">Customer Account Ledger</h1>
            <p className="text-xs text-slate-400 font-semibold">Track transactions, download statements, and issue dues reminders.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* PDF statement export */}
          <button
            onClick={handleExportPDF}
            disabled={pdfGenerating}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4.5 h-4.5" />
            <span>{pdfGenerating ? 'Generating...' : 'Export Statement'}</span>
          </button>

          {/* Delete customer profile */}
          <button
            onClick={handleDeleteCustomerProfile}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100/50 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Trash2 className="w-4.5 h-4.5" />
            <span>Delete Profile</span>
          </button>
        </div>
      </div>

      {/* 2. Customer profile summary */}
      {activeCustomer && (
        <CustomerProfile customer={activeCustomer} currency={currencyCode} />
      )}

      {/* 3. Dues collections messaging buttons */}
      {activeCustomer && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Schedule automatic email reminders for overdue payments.
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleTestEmail}
              disabled={testSending}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/30 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {testSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : testResult === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{testSending ? 'Sending...' : testResult === 'success' ? 'Sent!' : testResult === 'error' ? 'Failed' : 'Send Preview'}</span>
            </button>
            <ReminderButton
              customer={activeCustomer}
              shopName={shopkeeperName}
              currency={currencyCode}
            />
          </div>
        </div>
      )}

      {/* 4. Timeline list log and Give/Get transaction buttons */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Ledger logs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Ledger Timeline Logs</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{transactions.length} entries recorded</span>
          </div>

          {(transactionsError || customerError) && (
            <div className="p-3.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 font-bold" />
              <span>{transactionsError || customerError}</span>
            </div>
          )}

          <CustomerTransactions
            transactions={transactions}
            currency={currencyCode}
            onEdit={handleOpenEditTransaction}
            onDelete={handleTransactionDelete}
          />

          {/* Core action buttons bottom spacer overlay */}
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-50">
            {/* Merchant gave credit */}
            <button
              onClick={() => handleOpenAddTransaction('give')}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center space-x-2 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>You Gave (Credit / Dues)</span>
            </button>

            {/* Merchant got payment */}
            <button
              onClick={() => handleOpenAddTransaction('take')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center space-x-2 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>You Got (Take / Pay)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Transaction Entry Creation/Edit Modal */}
      <Modal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        title={editingTransaction ? 'Edit Ledger Entry Details' : `New Ledger Entry - You ${transactionFormType === 'give' ? 'Gave' : 'Got'}`}
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

export default CustomerDetails;
