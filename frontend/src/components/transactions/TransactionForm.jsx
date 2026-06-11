/**
 * TransactionForm — Create/Edit Transaction Entry
 *
 * Form for recording new credit transactions or editing existing ones.
 * Supports two modes:
 *   - "Give" (merchant gave credit / customer owes money) — red accent
 *   - "Take" (merchant received payment / customer paid) — green accent
 *
 * Features:
 *   - Give/Take toggle slider
 *   - Amount input with dynamic color border
 *   - Description text field
 *   - Date picker (defaults to today for new entries)
 *   - Receipt image upload with preview and 5MB size limit
 *   - Uses FormData for file upload support
 */

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, FileText, Image as ImageIcon, Calendar, Loader2, X, Plus, AlertCircle } from 'lucide-react';
import formatDate from '../../utils/formatDate';
import { API_BASE_URL } from '../../utils/constants';

const TransactionForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('give'); // 'give' (merchant gave credit) or 'take' (merchant received payment)
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Populate data when editing
  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount || '');
      setType(initialData.type || 'give');
      setDescription(initialData.description || '');
      if (initialData.date) {
        setDate(new Date(initialData.date).toISOString().split('T')[0]);
      } else {
        setDate('');
      }
      
      if (initialData.receiptImage) {
        setReceiptPreview(`${API_BASE_URL}${initialData.receiptImage}`);
      } else {
        setReceiptPreview('');
      }
    } else {
      // Default to today's date for new transactions
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files (JPEG/JPG/PNG/GIF) are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size exceeds the 5MB limit.');
        return;
      }

      setError('');
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    setReceiptFile(null);
    setReceiptPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please provide a valid transaction amount greater than zero.');
      return;
    }

    setError('');
    
    // Package parameters inside FormData if receipt file exists, otherwise standard object
    try {
      const payload = new FormData();
      payload.append('amount', Number(amount));
      payload.append('type', type);
      payload.append('description', description);
      if (date) payload.append('date', new Date(date).toISOString());
      
      if (receiptFile) {
        payload.append('receipt', receiptFile);
      }

      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'Failed to submit transaction.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Give vs Take Premium Toggle Slider */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 font-display">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
          <button
            type="button"
            onClick={() => setType('give')}
            disabled={loading}
            className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              type === 'give'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            You Gave (Due)
          </button>
          <button
            type="button"
            onClick={() => setType('take')}
            disabled={loading}
            className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              type === 'take'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            You Got (Take)
          </button>
        </div>
      </div>

      {/* Dynamic Colored High-Contrast Amount Box */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
          Transaction Amount *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <span className="text-sm font-semibold font-display">$ / ₹</span>
          </div>
          <input
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={loading}
            className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-lg font-bold font-display placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${
              type === 'give'
                ? 'border-rose-200 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/30'
            }`}
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
          Description / Details
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FileText className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Rice, sugar, flour, or invoice #12"
            disabled={loading}
            className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans"
          />
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
          Transaction Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Calendar className="w-4 h-4" />
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
            className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans"
          />
        </div>
      </div>

      {/* Receipt Photo Drag/Uploader Drawer */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
          Attach Receipt Photo
        </label>
        
        {receiptPreview ? (
          <div className="relative p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={receiptPreview}
                alt="Receipt thumbnail"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200"
              />
              <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                {receiptFile ? receiptFile.name : 'Attached Receipt.jpg'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearFile}
              disabled={loading}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-slate-50 hover:bg-slate-100/50 cursor-pointer rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center space-y-1.5 transition-all"
          >
            <ImageIcon className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Select Receipt Image</span>
            <span className="text-[9px] text-slate-400">JPEG/PNG, Max 5MB file size</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={loading}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Bottom Save Controls */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-2 text-white rounded-lg text-sm font-semibold shadow-md hover:opacity-90 transition-all flex items-center space-x-2 cursor-pointer ${
            type === 'give' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving entry...</span>
            </>
          ) : (
            <span>Save Ledger Entry</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
