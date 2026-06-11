/**
 * CustomerTable — Desktop Customer Directory Table
 *
 * Responsive HTML table displaying all customers with columns for:
 *   - Customer (avatar, name, address)
 *   - Contact (phone, email)
 *   - Last Activity (relative timestamp)
 *   - Net Balance (formatted currency + status pill: due/advance/settled)
 *   - Actions (view, edit, delete buttons)
 *
 * Shows an empty state illustration when no customers exist.
 * Used on the Customers page (desktop view only; mobile uses CustomerCard).
 */

import React from 'react';
import { Eye, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { getBalanceStanding } from '../../customers/customerUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { DEFAULT_CURRENCY } from '../../utils/constants';

const CustomerTable = ({ customers, currency = DEFAULT_CURRENCY, onView, onEdit, onDelete }) => {
  if (customers.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-2">
        <CheckCircle2 className="w-10 h-10 text-slate-300" />
        <h4 className="font-display text-slate-700 font-semibold">No customers found</h4>
        <p className="text-xs text-slate-400 max-w-sm">Create a new customer profile to start recording credit logs and managing reminders.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar bg-white rounded-2xl border border-slate-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Customer</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Contact</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Last Activity</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display text-right">Net Balance</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {customers.map((c) => {
            const standing = getBalanceStanding(c.netBalance);
            return (
              <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-display font-bold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 hover:text-teal-700 transition-colors cursor-pointer" onClick={() => onView(c._id)}>
                        {c.name}
                      </h4>
                      {c.address && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{c.address}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700 font-medium">{c.phone}</div>
                  {c.email && (
                    <div className="text-[11px] text-slate-400">{c.email}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                  {formatDate(c.updatedAt, 'relative')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <span className="font-display text-sm font-bold text-slate-800">
                      {formatCurrency(standing.absBalance, currency)}
                    </span>
                    <span className={`inline-flex items-center p-1 rounded-full text-[10px] ${standing.pillClass}`}>
                      {standing.status === 'due' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" title="You Gave / Money Owed" />
                      ) : standing.status === 'advance' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" title="You Got / Advance" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" title="Settled" />
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                    {standing.status === 'due' ? 'You gave (Owed)' : standing.status === 'advance' ? 'You got (Advance)' : 'Settled'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onView(c._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-teal-700 transition-all cursor-pointer"
                      title="View Transaction Ledger"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(c)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-teal-600 transition-all cursor-pointer"
                      title="Edit Customer Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(c._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                      title="Delete Customer & Ledger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
