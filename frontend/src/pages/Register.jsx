import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/');
  };

  return (
    <AuthLayout>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight font-display">Create Account</h2>
        <p className="text-xs text-slate-400 font-medium">
          Digitalize your shop ledgers and secure collections.
        </p>
      </div>

      <div className="mt-6">
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>

      <p className="text-center text-xs text-slate-400 font-semibold pt-4">
        Already registered?{' '}
        <Link to="/login" className="text-teal-700 hover:text-teal-800 font-bold underline transition-colors">
          Sign in here
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
