import React, { useState } from 'react';
import { Edit2, Trash2, Image as ImageIcon, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { getTransactionStyle } from '../../transactions/transactionUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import ReceiptPreviewModal from '../common/ReceiptPreviewModal';
import { DEFAULT_CURRENCY } from '../../utils/constants';

const TransactionTable = ({ transactions, currency = DEFAULT_CURRENCY, onEdit, onDelete }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-2">
        <FileText className="w-10 h-10 text-slate-300" />
        <h4 className="font-display text-slate-700 font-semibold">No transactions recorded</h4>
        <p className="text-xs text-slate-400 max-w-sm">Use the Give/Get controls to enter your first debit or credit log.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ReceiptPreviewModal
        receiptUrl={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Main Table */}
      <div className="overflow-x-auto custom-scrollbar bg-white rounded-2xl border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Type</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Description</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Receipt</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display text-right">Amount</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((tx) => {
              const style = getTransactionStyle(tx.type);
              return (
                <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    {formatDate(tx.date, 'short')}
                    <span className="block text-[10px] text-slate-400 mt-0.5">{formatDate(tx.date, 'time')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.pillClass}`}>
                      {tx.type === 'give' ? (
                        <ArrowUpRight className="w-3 h-3 text-rose-600" />
                      ) : (
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{style.typeLabel}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 max-w-[200px] truncate">
                    {tx.description || <span className="text-slate-400 italic">No description</span>}
                  </td>
                  <td className="px-6 py-4">
                    {tx.receiptImage ? (
                      <button
                        onClick={() => setSelectedReceipt(tx.receiptImage)}
                        className="inline-flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 shrink-0" />
                        <span>View Photo</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-display text-sm font-bold ${style.colorClass}`}>
                      {style.symbol} {formatCurrency(tx.amount, currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
