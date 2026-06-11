import React from 'react';

const Loader = ({ fullPage = false, message = 'Loading ledger details...' }) => {
  const spinnerElement = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-12 h-12">
        {/* Aesthetic double-ring modern spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="font-display text-sm font-medium text-slate-500 tracking-wide">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/70 backdrop-blur-md">
        <div className="p-8 rounded-2xl glass-card shadow-lg max-w-sm w-full text-center">
          {spinnerElement}
        </div>
      </div>
    );
  }

  return spinnerElement;
};

export default Loader;
