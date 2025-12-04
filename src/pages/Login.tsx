import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate(ROUTES.SHOP_MANAGEMENT);
    } catch (err) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E5E5E5' }}>
      <div className="w-full max-w-md px-8 py-16 rounded-3xl" style={{ backgroundColor: '#68BE6B' }}>
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
              className="w-full px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
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
              className="w-full py-4 rounded-lg text-white text-xl font-normal transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              style={{ backgroundColor: '#FDB7B7' }}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

