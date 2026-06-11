/**
 * Login Page
 *
 * Renders the login form inside the AuthLayout (two-column split).
 * On successful login, navigates to the dashboard (/).
 * Includes a link to the registration page for new merchants.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <AuthLayout>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight font-display">Welcome Back</h2>
        <p className="text-xs text-slate-400 font-medium">
          Enter your shopkeeper credentials to manage your ledgers.
        </p>
      </div>

      <div className="mt-6">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>

      <p className="text-center text-xs text-slate-400 font-semibold pt-4">
        New merchant?{' '}
        <Link to="/register" className="text-teal-700 hover:text-teal-800 font-bold underline transition-colors">
          Create shopkeeper account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
