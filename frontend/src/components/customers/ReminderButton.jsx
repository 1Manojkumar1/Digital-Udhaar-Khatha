/**
 * ReminderButton — Schedule Reminder Trigger & Modal
 *
 * Opens a scheduling modal for setting up automatic payment reminders
 * for a specific customer. The modal includes:
 *   - Scheduled date picker
 *   - Recurrence pattern selector (none, daily, weekly, biweekly, monthly, custom)
 *   - Repeat interval and max repeat count
 *   - Weekly: day-of-week selector; Monthly: day-of-month picker
 *   - Custom message textarea (pre-filled with balance + shop name)
 *
 * Disabled when customer balance is settled or in advance (no dues to remind).
 * Sends POST /api/reminders with the full recurrence configuration.
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { getBalanceStanding } from '../../customers/customerUtils';
import formatCurrency from '../../utils/formatCurrency';
import axiosInstance from '../../utils/axiosInstance';
import Modal from '../common/Modal';
import { DEFAULT_CURRENCY, REMINDER_PATTERN_LABELS } from '../../utils/constants';

const ReminderButton = ({ customer, shopName = 'our store', currency = DEFAULT_CURRENCY }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [recurrencePattern, setRecurrencePattern] = useState('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState([]);
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState(1);
  const [maxRecurrenceCount, setMaxRecurrenceCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!customer) return null;

  const standing = getBalanceStanding(customer.netBalance);
  const isSettledOrAdvance = standing.status !== 'due';

  const handleOpenScheduleModal = async () => {
    const formattedBalance = formatCurrency(standing.absBalance, currency);
    setCustomMessage(`Friendly reminder to clear your pending dues of ${formattedBalance} at ${shopName}. Thank you!`);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);
    setRecurrencePattern('none');
    setRecurrenceInterval(1);
    setRecurrenceDaysOfWeek([]);
    setRecurrenceDayOfMonth(1);
    setMaxRecurrenceCount('');
    setSuccessMsg('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const toggleDayOfWeek = (day) => {
    setRecurrenceDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduledDate || !customMessage) {
      setErrorMsg('Please supply a valid scheduled date and message.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        customerId: customer._id,
        scheduledDate: new Date(scheduledDate).toISOString(),
        message: customMessage,
        recurrencePattern,
        recurrenceInterval,
        maxRecurrenceCount: maxRecurrenceCount ? Number(maxRecurrenceCount) : null,
      };

      if (recurrencePattern === 'weekly') {
        payload.recurrenceDaysOfWeek = recurrenceDaysOfWeek;
      }
      if (recurrencePattern === 'monthly') {
        payload.recurrenceDayOfMonth = recurrenceDayOfMonth;
      }

      const response = await axiosInstance.post('/api/reminders', payload);

      if (response.data.success) {
        setSuccessMsg('Reminder scheduled successfully!');
        setTimeout(() => {
          setModalOpen(false);
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to schedule reminder.');
    } finally {
      setLoading(false);
    }
  };

  const weekDays = [
    { value: 'mon', label: 'Mon' },
    { value: 'tue', label: 'Tue' },
    { value: 'wed', label: 'Wed' },
    { value: 'thu', label: 'Thu' },
    { value: 'fri', label: 'Fri' },
    { value: 'sat', label: 'Sat' },
    { value: 'sun', label: 'Sun' },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleOpenScheduleModal}
          disabled={isSettledOrAdvance}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-800/30 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed shadow-sm transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule</span>
        </button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Schedule Reminder - ${customer.name}`}
        size="lg"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          {successMsg && (
            <div className="p-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Scheduled Date *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} disabled={loading}
                  className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 transition-all font-sans disabled:bg-slate-50" required />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Recurrence Pattern</label>
              <select value={recurrencePattern} onChange={(e) => setRecurrencePattern(e.target.value)} disabled={loading}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 transition-all font-sans disabled:bg-slate-50">
                {Object.entries(REMINDER_PATTERN_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {recurrencePattern !== 'none' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Repeat Every</label>
                <input type="number" min={1} value={recurrenceInterval} onChange={(e) => setRecurrenceInterval(Number(e.target.value))} disabled={loading}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 transition-all font-sans disabled:bg-slate-50" />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Max Repeats (leave empty = until balance cleared)</label>
              <input type="number" min={1} value={maxRecurrenceCount} onChange={(e) => setMaxRecurrenceCount(e.target.value)} placeholder="Unlimited" disabled={loading}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 transition-all font-sans disabled:bg-slate-50" />
            </div>
          </div>

          {recurrencePattern === 'weekly' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Days of Week</label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button key={day.value} type="button" onClick={() => toggleDayOfWeek(day.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      recurrenceDaysOfWeek.includes(day.value)
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recurrencePattern === 'monthly' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Day of Month</label>
              <input type="number" min={1} max={31} value={recurrenceDayOfMonth} onChange={(e) => setRecurrenceDayOfMonth(Number(e.target.value))} disabled={loading}
                className="w-24 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 transition-all font-sans disabled:bg-slate-50" />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">Reminder Message *</label>
            <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} disabled={loading} rows={3}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all font-sans resize-none disabled:bg-slate-50" required />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} disabled={loading}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-75">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Scheduling...</span></>
              ) : (
                <span>Confirm Schedule</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ReminderButton;
