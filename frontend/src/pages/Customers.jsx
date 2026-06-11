/**
 * Customers — Customer Directory Page
 *
 * Full customer management page with:
 *   - Header with "Add New Customer" button
 *   - Search bar with debounced server-side search (250ms delay)
 *   - Desktop: CustomerTable (full table view)
 *   - Mobile: CustomerCard grid (card layout)
 *   - Create/Edit modal using CustomerForm
 *
 * Supports CRUD operations: create, update, delete (with confirmation),
 * and navigation to individual customer detail pages.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, AlertCircle, RefreshCw } from 'lucide-react';
import useAuth from '../auth/useAuth';
import useCustomers from '../customers/useCustomers';
import CustomerTable from '../components/customers/CustomerTable';
import CustomerCard from '../components/customers/CustomerCard';
import CustomerForm from '../components/customers/CustomerForm';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';

const Customers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, fetchCustomers]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, data);
      } else {
        await createCustomer(data);
      }
      setModalOpen(false);
      fetchCustomers(searchQuery);
    } catch (err) {
      console.error('Failed to submit customer form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrigger = async (id) => {
    if (window.confirm('WARNING: Deleting this customer will permanently delete their entire credit transaction ledger history. This action cannot be undone. Are you sure you want to proceed?')) {
      try {
        await deleteCustomer(id);
        fetchCustomers(searchQuery);
      } catch (err) {
        console.error('Failed to delete customer:', err);
      }
    }
  };

  const handleViewCustomer = (id) => {
    navigate(`/customers/${id}`);
  };

  const currencyCode = user?.currency || 'INR';

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-display">Customer Directory</h1>
          <p className="text-xs text-slate-400 font-semibold">Search, edit, delete, or drill down into any customer ledger account.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* 2. Error box */}
      {error && (
        <div className="p-3.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Search and filtering panels */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        {loading && (
          <div className="text-slate-400 animate-spin">
            <RefreshCw className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* 4. Directory Grid - Responsive Table (desktop) / Cards (mobile) */}
      {loading && customers.length === 0 ? (
        <Loader message="Fetching customer records..." />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <CustomerTable
              customers={customers}
              currency={currencyCode}
              onView={handleViewCustomer}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTrigger}
            />
          </div>

          {/* Mobile Grid Cards View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {customers.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-2">
                <AlertCircle className="w-10 h-10 text-slate-300" />
                <h4 className="font-display text-slate-700 font-semibold text-sm">No customers found</h4>
                <p className="text-[10px] text-slate-400 max-w-xs">No records match your search or none have been added yet.</p>
              </div>
            ) : (
              customers.map((c) => (
                <CustomerCard
                  key={c._id}
                  customer={c}
                  currency={currencyCode}
                  onView={handleViewCustomer}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteTrigger}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Customer Create/Edit Drawer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? `Edit Profile - ${editingCustomer.name}` : 'Add New Customer Profile'}
        size="md"
      >
        <CustomerForm
          initialData={editingCustomer}
          onSubmit={handleFormSubmit}
          onCancel={() => setModalOpen(false)}
          loading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Customers;
