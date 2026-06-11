/**
 * Modal — Reusable Dialog Overlay
 *
 * Generic modal component with backdrop blur, close-on-backdrop-click,
 * body scroll lock while open, and configurable size (sm/md/lg/xl).
 * Used for customer forms, transaction forms, reminder scheduling,
 * and confirmation dialogs throughout the app.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0" onClick={onClose}></div>
      
      {/* Modal box */}
      <div className={`relative w-full ${sizeClasses[size]} p-6 rounded-2xl glass-modal shadow-2xl z-10 transition-transform duration-300 transform scale-100`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 font-display">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Main Body Content */}
        <div className="mt-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
