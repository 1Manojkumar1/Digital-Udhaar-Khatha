/**
 * Reminders — Reminder Management Page
 *
 * Centralized view for all scheduled, sent, failed, and completed reminders.
 *
 * Features:
 *   - Status filter tabs (all, pending, sent, failed, completed)
 *   - Each reminder shows: status badge, recurrence pattern, customer name,
 *     message preview, scheduled date, balance, and sent count
 *   - Actions: Send Now (for pending), Cancel (for pending)
 *   - Batch Schedule modal: schedules reminders for ALL customers with
 *     outstanding dues in one action, using each customer's individual
 *     reminder settings
 *   - Manual refresh button
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Send, Trash2, AlertTriangle, CheckCircle2, Clock, Filter, RefreshCw, Loader2 } from 'lucide-react';
import useAuth from '../auth/useAuth';
import reminderService from '../reminders/reminderService';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import formatDate from '../utils/formatDate';
import { REMINDER_STATUS_LABELS, REMINDER_PATTERN_LABELS } from '../utils/constants';

const statusFilters = ['all', 'pending', 'sent', 'failed', 'completed'];

const Reminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sendingId, setSendingId] = useState(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchMessage, setBatchMessage] = useState('');
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchResult, setBatchResult] = useState('');

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await reminderService.getAll(params);
      if (response.success) setReminders(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleSendNow = async (id) => {
    setSendingId(id);
    try {
      await reminderService.sendNow(id);
      fetchReminders();
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this scheduled reminder?')) return;
    try {
      await reminderService.remove(id);
      fetchReminders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBatchSchedule = async (e) => {
    e.preventDefault();
    setBatchSubmitting(true);
    setBatchResult('');
    try {
      const response = await reminderService.batchSchedule({
        message: batchMessage || undefined,
      });
      setBatchResult(response.message || 'Done!');
      setTimeout(() => {
        setBatchModalOpen(false);
        fetchReminders();
      }, 1500);
    } catch (err) {
      setBatchResult(`Error: ${err.message}`);
    } finally {
      setBatchSubmitting(false);
    }
  };

  const currency = user?.currency || 'INR';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-teal-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-display">Reminders</h1>
            <p className="text-xs text-slate-400 font-semibold">Manage scheduled notifications.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setBatchModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Batch Schedule</span>
          </button>
          <button
            onClick={fetchReminders}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-1.5 flex-wrap gap-1.5">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === f
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All' : REMINDER_STATUS_LABELS[f] || f}
          </button>
        ))}
      </div>

      {/* Reminder list */}
      {loading ? (
        <Loader message="Loading reminders..." />
      ) : error ? (
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <p className="text-sm text-rose-600 font-medium">{error}</p>
        </div>
      ) : reminders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-3">
          <Bell className="w-10 h-10 text-slate-300" />
          <h4 className="font-display text-slate-700 font-semibold">No reminders found</h4>
          <p className="text-xs text-slate-400 max-w-sm">
            {statusFilter !== 'all'
              ? `No reminders with status "${statusFilter}".`
              : 'Reminders are auto-created when you record a credit (give) transaction.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
            {reminders.map((reminder) => {
            const customer = reminder.customer && typeof reminder.customer === 'object' ? reminder.customer : {};
            const statusColors = {
              pending: 'bg-amber-50 text-amber-700 border-amber-100',
              sent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
              failed: 'bg-rose-50 text-rose-700 border-rose-100',
              completed: 'bg-slate-50 text-slate-500 border-slate-100',
            };

            return (
              <div
                key={reminder._id}
                className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusColors[reminder.status] || 'bg-slate-50 text-slate-600'}`}>
                        {REMINDER_STATUS_LABELS[reminder.status] || reminder.status}
                      </span>
                      {reminder.recurrencePattern && reminder.recurrencePattern !== 'none' && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[9px] font-bold uppercase border border-purple-100">
                          {REMINDER_PATTERN_LABELS[reminder.recurrencePattern]}
                        </span>
                      )}
                      {reminder.recurrenceSentCount > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Sent {reminder.recurrenceSentCount}x
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800">
                      {customer.name || 'Unknown Customer'}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2">{reminder.message}</p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Scheduled: {formatDate(reminder.scheduledDate, 'full')}</span>
                      </span>
                      {customer.netBalance !== undefined && (
                        <span>
                          Balance: {currency} {Math.abs(customer.netBalance)}
                        </span>
                      )}
                    </div>

                    {reminder.maxRecurrenceCount && (
                      <p className="text-[10px] text-slate-400">
                        Max repeats: {reminder.maxRecurrenceCount}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {reminder.status === 'pending' && (
                      <button
                        onClick={() => handleSendNow(reminder._id)}
                        disabled={sendingId === reminder._id}
                        className="p-1.5 rounded text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer disabled:opacity-50"
                        title="Send now"
                      >
                        <Send className={`w-3.5 h-3.5 ${sendingId === reminder._id ? 'animate-pulse' : ''}`} />
                      </button>
                    )}
                    {reminder.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        className="p-1.5 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                        title="Cancel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Batch Schedule Modal */}
      <Modal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        title="Batch Schedule Reminders"
        size="md"
      >
        <form onSubmit={handleBatchSchedule} className="space-y-4">
          {batchResult && (
            <div className="p-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{batchResult}</span>
            </div>
          )}

          <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-700 font-medium">
            Each customer's individual "Start after" and "Repeat every" settings will be used. The message below is optional.
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
              Custom Message (optional)
            </label>
            <textarea
              value={batchMessage}
              onChange={(e) => setBatchMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 transition-all font-sans resize-none"
              placeholder="Leave blank to use per-customer default messages with their balance details."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBatchModalOpen(false)}
              disabled={batchSubmitting}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={batchSubmitting}
              className="px-5 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              {batchSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Schedule for All Due Customers</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reminders;
