/**
 * App — Root Component & Route Definitions
 *
 * Defines all client-side routes and wraps the entire app in AuthContext
 * so authentication state is accessible everywhere.
 *
 * Route structure:
 *   /login, /register  — Public (redirect to / if already logged in)
 *   /                  — Dashboard home with summary stats
 *   /customers         — Customer directory list
 *   /customers/:id     — Individual customer ledger (transactions, reminders)
 *   /transactions      — Global transaction viewer (select customer first)
 *   /statements        — PDF statement generator
 *   /reminders         — Reminder management and batch scheduling
 *   *                  — Catch-all redirect to /
 *
 * PrivateRoute ensures unauthenticated users are sent to /login.
 * PublicRoute ensures logged-in users can't revisit auth pages.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import useAuth from './auth/useAuth';

// Layout mounts
import DashboardLayout from './layouts/DashboardLayout';

// Auth gateways
import Login from './pages/Login';
import Register from './pages/Register';

// Core Dashboard Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Transactions from './pages/Transactions';
import Statements from './pages/Statements';
import Reminders from './pages/Reminders';
import Loader from './components/common/Loader';

// Route Guard forcing users to login if unauthenticated
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage={true} message="Authenticating merchant credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace={true} />;
  }

  return children;
};

// Route Guard preventing logged-in users from seeing Auth screens
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage={true} message="Validating active session..." />;
  }

  if (user) {
    return <Navigate to="/" replace={true} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        
        {/* 1. Public Authentication Gateways */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* 2. Protected Ledger Dashboard Space */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Customers />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CustomerDetails />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Transactions />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/statements"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Statements />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Reminders />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* 3. Fallback Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace={true} />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;