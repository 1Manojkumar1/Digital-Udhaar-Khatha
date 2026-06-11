/**
 * StatementGenerator — PDF Statement Download Widget
 *
 * Form that allows the shopkeeper to generate and download a PDF
 * account statement for a specific customer.
 *
 * Fields:
 *   - Customer selector (dropdown from directory)
 *   - Start date (optional — defaults to full history)
 *   - End date (optional — defaults to today)
 *
 * On submit, calls statementService.downloadPDF() which hits the backend
 * PDF generation endpoint, then triggers a browser download via pdfDownload().
 * The filename includes the customer's sanitized name.
 */

import React, { useState } from 'react';
import { FileText, Download, Calendar, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import statementService from '../../statements/statementService';
import pdfDownload from '../../utils/pdfDownload';

const StatementGenerator = ({ customers }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer to generate a statement.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);
      const sanitizedName = selectedCustomer
        ? selectedCustomer.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        : 'customer';

      // Download PDF raw blob
      const blob = await statementService.downloadPDF(
        selectedCustomerId,
        startDate,
        endDate
      );

      // Trigger standard browser download
      pdfDownload(blob, `ledger_statement_${sanitizedName}.pdf`);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to download statement PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-lg w-full">
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-50">
          <FileText className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Download Account Statement</h3>
            <p className="text-[11px] text-slate-400 font-medium">Export a formatted PDF ledger report for audits or customers.</p>
          </div>
        </div>

        {success && (
          <div className="p-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Ledger statement downloaded successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Select Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
            Select Customer *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setError('');
              }}
              disabled={loading}
              className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans disabled:bg-slate-50 appearance-none"
              required
            >
              <option value="">-- Choose from directory --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Ranges selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
              Start Date (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
                className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans disabled:bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
              End Date (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
                className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-75 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Generating PDF Stream...</span>
            </>
          ) : (
            <>
              <Download className="w-4.5 h-4.5" />
              <span>Download PDF Statement</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default StatementGenerator;
