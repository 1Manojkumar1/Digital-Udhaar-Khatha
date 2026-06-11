/**
 * RegisterForm — New Shopkeeper Registration Form
 *
 * Multi-field form for creating a new shopkeeper account.
 * Fields: Full Name, Phone, Email, Password, Shop Name, Preferred Currency.
 * Calls AuthContext.register() on submit and navigates to dashboard on success.
 */

import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Store, DollarSign, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuth from '../../auth/useAuth';

const RegisterForm = ({ onSuccess }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [currency, setCurrency] = useState('INR');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone || !shopName) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormError('');
    setLoading(true);
    try {
      await register(name, email, password, phone, shopName, currency);
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="p-3.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl font-medium">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Arjun Kumar"
              disabled={loading}
              className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all disabled:bg-slate-50"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              disabled={loading}
              className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all disabled:bg-slate-50"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="arjun@grocery.com"
            disabled={loading}
            className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all disabled:bg-slate-50"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className="w-full pl-9.5 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all disabled:bg-slate-50"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
            Shop Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Store className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Arjun Grocery Store"
              disabled={loading}
              className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all disabled:bg-slate-50"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 font-display">
            Preferred Currency
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={loading}
              className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/50 transition-all disabled:bg-slate-50 appearance-none font-sans"
            >
              <option value="INR">INR (₹) Rupees</option>
              <option value="USD">USD ($) Dollars</option>
              <option value="EUR">EUR (€) Euros</option>
              <option value="GBP">GBP (£) Pounds</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-2 bg-teal-700 text-white rounded-xl text-sm font-semibold tracking-wide shadow-md hover:bg-teal-800 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create Shopkeeper Account</span>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
