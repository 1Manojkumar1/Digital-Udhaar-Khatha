import React from 'react';
import { Store, ShieldCheck, TrendingUp } from 'lucide-react';

const AuthLayout = ({ children, title = 'Digital Udhar Khatha' }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans">
      
      {/* 1. Left side brand cover (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-teal-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Glow decorative shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-teal-700/40 blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-teal-900/50 blur-3xl -ml-20 -mb-20"></div>

        {/* Top Branding */}
        <div className="flex items-center space-x-2.5 relative z-10">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Store className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-wide uppercase">Udhar Khatha</span>
        </div>

        {/* Slogan details */}
        <div className="space-y-6 relative z-10">
          <h1 className="text-4xl font-extrabold font-display leading-[1.1] tracking-tight">
            Clear dues.<br />
            Secure trust.<br />
            Grow business.
          </h1>
          <p className="text-sm text-teal-100 font-medium leading-relaxed max-w-sm">
            Digitalize your merchant bookkeeping ledger. Schedule automatic reminders, collect payments faster, and download verified account statements instantly.
          </p>
        </div>

        {/* Footer brand values */}
        <div className="flex items-center space-x-6 text-xs text-teal-200 font-semibold relative z-10">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure Cloud Backup</span>
          </span>
          <span className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Frictionless Tracking</span>
          </span>
        </div>
      </div>

      {/* 2. Right side form workspace */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="lg:hidden flex items-center space-x-2.5 justify-center mb-6">
            <div className="w-9 h-9 bg-teal-700 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-slate-800 tracking-wide text-md">Udhar Khatha</span>
          </div>

          <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
