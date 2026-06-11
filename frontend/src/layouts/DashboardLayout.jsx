import React, { useState } from 'react';
import { Menu, X, Store, LogOut, LayoutDashboard, Users, CreditCard, FileText, Bell } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import EmailStatus from '../components/twilio/EmailStatus';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/transactions', label: 'Transactions', icon: CreditCard },
    { to: '/statements', label: 'PDF Statements', icon: FileText },
    { to: '/reminders', label: 'Reminders', icon: Bell },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      
      {/* 1. Desktop Sidebar Left */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-2.5">
          <div className="w-8.5 h-8.5 bg-teal-600 rounded-lg flex items-center justify-center">
            <Store className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-extrabold text-sm tracking-widest text-white uppercase">Udhar Khatha</span>
        </div>

        {/* User profile capsule */}
        {user && (
          <div className="p-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/20">
            <div className="w-9 h-9 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-display font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.shopName}</p>
            </div>
          </div>
        )}

        {/* Links Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Bottom Trigger */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Menu slide drawer overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/50 backdrop-blur-xs">
          <div className="w-64 bg-slate-900 text-slate-200 p-6 flex flex-col h-full animate-slide-in">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-teal-500" />
                <span className="font-display font-extrabold text-sm uppercase tracking-wider text-white">Udhar Khatha</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                        isActive ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Sign Out</span>
            </button>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* 3. Right Side Panel Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* dynamic breadcrumbs summary */}
            {user && (
              <div className="hidden sm:block">
                <h2 className="text-sm font-bold text-slate-800 leading-none font-display uppercase tracking-wider">{user.shopName}</h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Currency: {user.currency || 'INR'}</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <EmailStatus />
            {user && (
              <div className="flex items-center space-x-2.5">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-slate-700 leading-none">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{user.email}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-800 border border-teal-100 flex items-center justify-center font-display font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Context Box */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
