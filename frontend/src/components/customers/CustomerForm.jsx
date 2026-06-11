/**
 * CustomerForm — Create/Edit Customer Profile
 *
 * Form used for both adding new customers and editing existing ones.
 * When initialData is provided, the form is pre-populated (edit mode).
 *
 * Fields:
 *   - Name (required), Phone (required), Email, Address
 *   - Reminder settings: Start after (interval + unit), Repeat every (interval + unit)
 *
 * Reminder settings control when automatic email reminders begin after
 * a credit transaction and how often they repeat until the balance is cleared.
 */

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Loader2, Bell } from 'lucide-react';

const CustomerForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [reminderIntervalValue, setReminderIntervalValue] = useState(7);
  const [reminderIntervalUnit, setReminderIntervalUnit] = useState('days');
  const [repeatIntervalValue, setRepeatIntervalValue] = useState(1);
  const [repeatIntervalUnit, setRepeatIntervalUnit] = useState('days');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      if (initialData.reminderIntervalValue !== undefined) {
        setReminderIntervalValue(initialData.reminderIntervalValue);
      }
      if (initialData.reminderIntervalUnit) {
        setReminderIntervalUnit(initialData.reminderIntervalUnit);
      }
      if (initialData.repeatIntervalValue !== undefined) {
        setRepeatIntervalValue(initialData.repeatIntervalValue);
      }
      if (initialData.repeatIntervalUnit) {
        setRepeatIntervalUnit(initialData.repeatIntervalUnit);
      }
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      setError('Name and Phone Number are required fields.');
      return;
    }
    setError('');
    try {
      await onSubmit({
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
        reminderIntervalValue: Number(reminderIntervalValue),
        reminderIntervalUnit,
        repeatIntervalValue: Number(repeatIntervalValue),
        repeatIntervalUnit,
      });
    } catch (err) {
      setError(err.message || 'Failed to submit form.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Customer Name *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" disabled={loading}
              className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans disabled:bg-slate-50" required />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Phone Number *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" disabled={loading}
              className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans disabled:bg-slate-50" required />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" disabled={loading}
              className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans disabled:bg-slate-50" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Home/Business Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shop 12, Main Street, Delhi" disabled={loading} rows={2}
              className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans resize-none disabled:bg-slate-50" />
          </div>
        </div>
      </div>

      {/* Reminder Settings Section */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-teal-600" />
          <h3 className="font-display font-bold text-slate-700 text-sm">Automated Reminder Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start after */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Start after</label>
            <div className="flex space-x-2">
              <input type="number" min={0} value={reminderIntervalValue} onChange={(e) => setReminderIntervalValue(Number(e.target.value))} disabled={loading}
                className="w-24 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans disabled:bg-slate-50" />
              <select value={reminderIntervalUnit} onChange={(e) => setReminderIntervalUnit(e.target.value)} disabled={loading}
                className="w-32 px-2 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 transition-all font-sans disabled:bg-slate-50">
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Delay before the first reminder is sent after a credit transaction.</p>
          </div>

          {/* Repeat every */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Repeat every</label>
            <div className="flex space-x-2">
              <input type="number" min={1} value={repeatIntervalValue} onChange={(e) => setRepeatIntervalValue(Number(e.target.value))} disabled={loading}
                className="w-24 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans disabled:bg-slate-50" />
              <select value={repeatIntervalUnit} onChange={(e) => setRepeatIntervalUnit(e.target.value)} disabled={loading}
                className="w-32 px-2 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 transition-all font-sans disabled:bg-slate-50">
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">How often to repeat the reminder until the balance clears.</p>
          </div>

        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} disabled={loading}
          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-5 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-75">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
          ) : (
            <span>Save Customer</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
