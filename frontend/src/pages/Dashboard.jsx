/**
 * Dashboard — Home Page & Business Overview
 *
 * The main landing page after login, showing:
 *   1. Welcome banner with shop name
 *   2. TransactionSummary cards (total to receive, total got, net standing)
 *   3. Top 5 outstanding dues list (customers with highest netBalance)
 *   4. Quick action buttons (Add Customer, Generate Statements)
 *   5. Customer count stat card
 *   6. Add Customer modal (inline, triggered from quick action)
 *
 * Fetches all customers on mount and aggregates stats using
 * aggregateCustomerStats(). The dues list is sorted descending by balance.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, TrendingUp, AlertCircle, Users, CheckCircle2, User, FileText } from 'lucide-react';
import useAuth from '../auth/useAuth';
import useCustomers from '../customers/useCustomers';
import { aggregateCustomerStats, getBalanceStanding } from '../customers/customerUtils';
import TransactionSummary from '../components/transactions/TransactionSummary';
import Modal from '../components/common/Modal';
import CustomerForm from '../components/customers/CustomerForm';
import Loader from '../components/common/Loader';
import formatCurrency from '../utils/formatCurrency';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { customers, loading, error, fetchCustomers, createCustomer } = useCustomers();
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const stats = aggregateCustomerStats(customers);

  const handleAddCustomerSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createCustomer(data);
      setCustomerModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to create customer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort customers by netBalance descending to get those who owe the merchant the most
  const highBalanceDues = [...customers]
    .filter((c) => (c.netBalance || 0) > 0)
    .sort((a, b) => b.netBalance - a.netBalance)
    .slice(0, 5);

  const currencyCode = user?.currency || 'INR';

  if (loading && customers.length === 0) {
    return <Loader message="Analyzing merchant bookkeeping stats..." />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden border border-slate-800 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10 space-y-1.5">
          <h1 className="text-xl md:text-2xl font-bold font-display">Welcome, {user?.name || 'Shopkeeper'}!</h1>
          <p className="text-xs text-slate-400 font-medium max-w-md">
            Here is your real-time business standing for <strong className="text-teal-400">{user?.shopName}</strong>.
          </p>
        </div>
      </div>

      {/* 2. Global Tally Metrics Summaries */}
      {error && (
        <div className="p-3.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      <TransactionSummary
        totalToReceive={stats.totalToReceive}
        totalToPay={stats.totalToPay}
        currency={currencyCode}
      />

      {/* 3. Primary Actions & Ledger Highlight Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Top Dues (Quick Collections Panel) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm">Top Outstanding Collections</h3>
              <p className="text-[10px] text-slate-400 font-medium">Customers with the highest pending credit balances.</p>
            </div>
            <button
              onClick={() => navigate('/customers')}
              className="inline-flex items-center space-x-1 text-xs text-teal-700 font-bold hover:text-teal-800 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {highBalanceDues.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-2 text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-slate-200" />
              <h4 className="font-display text-sm font-semibold text-slate-700">Perfectly Balanced!</h4>
              <p className="text-[10px] text-slate-400 max-w-xs">No customer currently owes money on credit. All ledger balances are settled.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {highBalanceDues.map((c) => {
                const standing = getBalanceStanding(c.netBalance);
                return (
                  <div
                    key={c._id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/50 rounded-xl px-2 transition-colors cursor-pointer"
                    onClick={() => navigate(`/customers/${c._id}`)}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-display font-bold text-xs shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{c.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{c.phone}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-display text-xs font-extrabold text-rose-600">
                        {formatCurrency(standing.absBalance, currencyCode)}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Owes you</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Quick Action Widgets */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Quick Buttons Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Quick Actions</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Add Customer Trigger */}
              <button
                onClick={() => setCustomerModalOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-teal-50 border border-teal-100 hover:bg-teal-100/50 rounded-2xl transition-all cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2 bg-teal-700 text-white rounded-xl">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Add New Customer</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Record a new buyer into your book</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-700" />
              </button>

              {/* View all reports */}
              <button
                onClick={() => navigate('/statements')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200/50 hover:bg-slate-100/50 rounded-2xl transition-all cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2 bg-slate-800 text-white rounded-xl">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Generate Statements</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Compile and export transaction PDFs</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* Quick Stats Capsule */}
          <div className="bg-gradient-to-br from-teal-800 to-teal-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-sm flex-1 flex flex-col justify-between min-h-[160px]">
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/5 blur-2xl -mr-10 -mt-10"></div>
            
            <div className="space-y-1 relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-teal-300 font-display">Directory Count</span>
              <h2 className="text-3xl font-black font-display">{stats.customerCount}</h2>
            </div>
            
            <div className="flex items-center justify-between border-t border-white/10 pt-4 relative z-10">
              <span className="text-[10px] text-teal-100 font-medium">Active bookkeeping ledgers</span>
              <div className="p-1 rounded bg-teal-700/50 border border-white/10 text-white text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Book sync active</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Customer Form Modal Drawer */}
      <Modal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        title="Add New Customer Profile"
        size="md"
      >
        <CustomerForm
          onSubmit={handleAddCustomerSubmit}
          onCancel={() => setCustomerModalOpen(false)}
          loading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
