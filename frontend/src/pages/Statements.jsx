import React, { useEffect } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import useCustomers from '../customers/useCustomers';
import StatementGenerator from '../components/statements/StatementGenerator';
import Loader from '../components/common/Loader';

const Statements = () => {
  const { customers, loading, error, fetchCustomers } = useCustomers();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-xl font-bold text-slate-800 font-display">Account Statements</h1>
        <p className="text-xs text-slate-400 font-semibold">Generate structured and auditor-ready PDF reports for your bookkeeping accounts.</p>
      </div>

      {error && (
        <div className="p-3.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Main layout grid containing statement downloader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Downloader widget */}
        <div className="lg:col-span-6">
          {loading && customers.length === 0 ? (
            <Loader message="Loading directory list for statements..." />
          ) : (
            <StatementGenerator customers={customers} />
          )}
        </div>

        {/* Right Side: Informative static cards */}
        <div className="lg:col-span-6 bg-slate-50 p-6 rounded-3xl border border-slate-200/50 space-y-4">
          <h3 className="font-display font-semibold text-slate-800 text-sm">Statement Export Guidelines</h3>
          
          <ul className="space-y-3.5 text-xs text-slate-500 font-medium list-disc pl-4">
            <li>
              <strong>Default Statement</strong>: If no custom date range is specified, the PDF will compile the complete transaction history ledger since the customer profile was created.
            </li>
            <li>
              <strong>Audit Scopes</strong>: Specify exact start and end dates to restrict statement reports to weekly, monthly, or annual intervals.
            </li>
            <li>
              <strong>Signatures</strong>: Generated statements automatically embed your shop name (<strong>{customers[0]?.user?.shopName || 'your store'}</strong>) and merchant email details in the header block for verification.
            </li>
          </ul>

          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 text-[11px] text-teal-800 font-semibold leading-relaxed">
            Automatic Reminders are independent of statement exports. Reminders are scheduled when giving credit to prompt clearing balances.
          </div>
        </div>

      </div>
    </div>
  );
};

export default Statements;
