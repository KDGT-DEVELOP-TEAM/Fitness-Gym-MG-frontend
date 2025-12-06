import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { getErrorMessage } from '../utils/errorMessages';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, actionLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate(ROUTES.SHOP_MANAGEMENT);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-login-bg">
      <div className="w-full max-w-md px-8 py-16 rounded-3xl bg-login-card font-poppins">
        <h2 className="text-5xl font-normal text-white text-center mb-12">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-white bg-red-500 bg-opacity-20 px-4 py-2 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-white text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={actionLoading}
              className="w-full px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={actionLoading}
              className="w-full px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="text-right mt-2">
              <a href="#" className="text-white text-sm hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>
          <div className="pt-8">
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-4 rounded-lg text-white text-xl font-normal bg-login-button transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'サインイン中...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

