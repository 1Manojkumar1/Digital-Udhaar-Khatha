/**
 * CustomerCard — Mobile Customer Directory Card
 *
 * Compact card layout for displaying a single customer on mobile screens.
 * Shows avatar, name, phone, balance badge with status indicator,
 * last active time, and action buttons (view, edit, delete).
 * Used as the mobile alternative to CustomerTable.
 */

import React from 'react';
import { Eye, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { getBalanceStanding } from '../../customers/customerUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { DEFAULT_CURRENCY } from '../../utils/constants';

const CustomerCard = ({ customer, currency = DEFAULT_CURRENCY, onView, onEdit, onDelete }) => {
  const c = customer;
  const standing = getBalanceStanding(c.netBalance);

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4 hover:border-slate-200 transition-all">
      {/* Top Profile Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-display font-bold text-sm">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4
              className="text-sm font-semibold text-slate-800 hover:text-teal-700 transition-colors cursor-pointer"
              onClick={() => onView(c._id)}
            >
              {c.name}
            </h4>
            <p className="text-xs text-slate-500 font-medium">{c.phone}</p>
          </div>
        </div>

        {/* Balance badge */}
        <div className="text-right">
          <div className="flex items-center justify-end space-x-1.5">
            <span className="font-display text-sm font-bold text-slate-800">
              {formatCurrency(standing.absBalance, currency)}
            </span>
            <span className={`inline-flex items-center p-0.5 rounded-full text-[8px] ${standing.pillClass}`}>
              {standing.status === 'due' ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : standing.status === 'advance' ? (
                <ArrowDownLeft className="w-3 h-3" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
            {standing.status === 'due' ? 'You gave' : standing.status === 'advance' ? 'You got (Adv)' : 'Settled'}
          </span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px] text-slate-400">
        <div>
          Active: <span className="font-medium text-slate-600">{formatDate(c.updatedAt, 'relative')}</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onView(c._id)}
            className="p-1 rounded-lg text-slate-500 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(c)}
            className="p-1 rounded-lg text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-teal-600 transition-all cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(c._id)}
            className="p-1 rounded-lg text-slate-500 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
