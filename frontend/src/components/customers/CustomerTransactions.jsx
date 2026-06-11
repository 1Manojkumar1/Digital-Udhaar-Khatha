/**
 * CustomerTransactions — Timeline Transaction Log
 *
 * Renders a customer's transaction history as a vertical timeline grouped by date.
 * Each transaction entry shows:
 *   - Type pill (You Gave / You Got) with color-coded indicator bar
 *   - Description and optional receipt photo link
 *   - Amount with currency formatting and timestamp
 *   - Edit and delete action buttons
 *
 * Uses groupTransactionsByDate() to cluster entries under date headers.
 * Receipt photos open in a ReceiptPreviewModal on click.
 */

import React, { useState } from 'react';
import { Edit2, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { getTransactionStyle, groupTransactionsByDate } from '../../transactions/transactionUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import ReceiptPreviewModal from '../common/ReceiptPreviewModal';
import { DEFAULT_CURRENCY } from '../../utils/constants';

const CustomerTransactions = ({ transactions, currency = DEFAULT_CURRENCY, onEdit, onDelete }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-3">
        <FileText className="w-10 h-10 text-slate-300 animate-pulse" />
        <h4 className="font-display text-slate-700 font-semibold">Ledger is empty</h4>
        <p className="text-xs text-slate-400 max-w-sm">No transaction entries found for this customer. Press the You Gave or You Got buttons below to record credit logs.</p>
      </div>
    );
  }

  const grouped = groupTransactionsByDate(transactions);

  return (
    <div className="space-y-6">
      <ReceiptPreviewModal
        receiptUrl={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Ledger Log */}
      <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6">
        {grouped.map((group) => (
          <div key={group.dateStr} className="relative">
            {/* Timeline dot date indicator */}
            <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white ring-4 ring-slate-50/50"></div>
            
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-display">
              {formatDate(group.dateObj, 'full')}
            </h4>

            <div className="space-y-3">
              {group.items.map((tx) => {
                const style = getTransactionStyle(tx.type);
                return (
                  <div
                    key={tx._id}
                    className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-200 transition-all gap-4"
                  >
                    {/* Left: Type indicator pill, descriptions and receipt photos */}
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`w-1.5 h-10 rounded-full shrink-0 ${style.indicatorClass}`}></div>
                      
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.pillClass}`}>
                            {style.typeLabel}
                          </span>
                          {tx.receiptImage && (
                            <button
                              onClick={() => setSelectedReceipt(tx.receiptImage)}
                              className="inline-flex items-center space-x-1 text-[10px] text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Receipt Photo</span>
                            </button>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-[200px] md:max-w-md">
                          {tx.description || <span className="text-slate-400 italic">No description</span>}
                        </p>
                      </div>
                    </div>

                    {/* Right: Balance statistics & actions */}
                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="text-right">
                        <span className={`font-display text-base font-bold ${style.colorClass}`}>
                          {style.symbol} {formatCurrency(tx.amount, currency)}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5 font-semibold">
                          {formatDate(tx.date, 'time')}
                        </span>
                      </div>

                      <div className="flex items-center border-l border-slate-100 pl-3 space-x-1">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1 rounded text-slate-400 hover:bg-slate-50 hover:text-teal-600 transition-all cursor-pointer"
                          title="Edit ledger entry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(tx._id)}
                          className="p-1 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                          title="Delete ledger entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerTransactions;
