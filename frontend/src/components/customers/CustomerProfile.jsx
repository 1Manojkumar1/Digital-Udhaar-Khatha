import React from 'react';
import { Phone, Mail, MapPin, Calendar, Bell, CheckCircle2 } from 'lucide-react';
import { getBalanceStanding } from '../../customers/customerUtils';
import formatCurrency from '../../utils/formatCurrency';
import { DEFAULT_CURRENCY, REMINDER_PATTERN_LABELS } from '../../utils/constants';

const CustomerProfile = ({ customer, currency = DEFAULT_CURRENCY }) => {
  if (!customer) return null;

  const standing = getBalanceStanding(customer.netBalance);

  const reminderPattern = customer.reminderPattern || 'daily';
  const reminderMaxCount = customer.reminderMaxCount;
  const startAfterValue = customer.reminderIntervalValue ?? 7;
  const startAfterUnit = customer.reminderIntervalUnit || 'days';
  const repeatValue = customer.repeatIntervalValue ?? 1;
  const repeatUnit = customer.repeatIntervalUnit || 'days';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="flex items-start space-x-4">
        <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center font-display font-bold text-xl border border-teal-100/50">
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-800 font-display">{customer.name}</h2>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
            <span className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.phone}</span>
            </span>
            {customer.email && (
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.email}</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Start after: {startAfterValue} {startAfterUnit}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>Repeat every: {repeatValue} {repeatUnit}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>{REMINDER_PATTERN_LABELS[reminderPattern] || reminderPattern}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
            {reminderMaxCount && <span>Max repeats: {reminderMaxCount}</span>}
            {customer.reminderMinBalance !== undefined && customer.reminderMinBalance !== 1 && (
              <span>Min balance: {currency} {customer.reminderMinBalance}</span>
            )}
          </div>

          {customer.address && (
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[280px] md:max-w-xs">{customer.address}</span>
            </div>
          )}
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${standing.colorClass} flex flex-col space-y-1 min-w-[200px] shrink-0`}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">
          {standing.label}
        </span>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-display leading-none">
            {formatCurrency(standing.absBalance, currency)}
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            {standing.status === 'due' ? 'You should receive' : standing.status === 'advance' ? 'Advance paid' : 'No balance'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
