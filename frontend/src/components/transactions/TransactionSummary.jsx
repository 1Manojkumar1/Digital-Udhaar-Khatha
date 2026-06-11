/**
 * TransactionSummary — Three-Card Financial Overview
 *
 * Displays three summary cards showing the merchant's overall financial standing:
 *   1. Total Outstanding (money to receive / credit given) — red
 *   2. Total Advances (money received / payments settled) — green
 *   3. Net Standing (difference between the two) — color-coded
 *
 * Used on the Dashboard page to give an at-a-glance business health view.
 */

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Scale, CheckCircle2 } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import { DEFAULT_CURRENCY } from '../../utils/constants';

const TransactionSummary = ({ totalToReceive = 0, totalToPay = 0, currency = DEFAULT_CURRENCY }) => {
  const netStanding = totalToReceive - totalToPay;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Total Outstanding (Money Owed / Merchant Gave Credit) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">
            You Gave (To Receive)
          </span>
          <h3 className="text-2xl font-bold font-display text-slate-800 leading-none">
            {formatCurrency(totalToReceive, currency)}
          </h3>
          <span className="text-[10px] text-rose-500 font-semibold mt-1 block">Pending collections</span>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Total Advances (Money Merchant Got) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">
            You Got (To Settle)
          </span>
          <h3 className="text-2xl font-bold font-display text-slate-800 leading-none">
            {formatCurrency(totalToPay, currency)}
          </h3>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1 block">Customer advances</span>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
          <ArrowDownLeft className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Net Standing (Net Balance) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">
            Net Standing
          </span>
          <h3 className={`text-2xl font-bold font-display leading-none ${
            netStanding > 0 ? 'text-rose-600' : netStanding < 0 ? 'text-emerald-600' : 'text-slate-700'
          }`}>
            {formatCurrency(Math.abs(netStanding), currency)}
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
            {netStanding > 0 ? 'Outstanding due' : netStanding < 0 ? 'Surplus credit' : 'Perfectly balanced'}
          </span>
        </div>
        <div className={`p-2.5 rounded-xl ${
          netStanding > 0 ? 'bg-rose-50 text-rose-600' : netStanding < 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
        }`}>
          <Scale className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
