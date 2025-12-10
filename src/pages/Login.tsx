import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { getErrorMessage } from '../utils/loginErrorMessages';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const { login, actionLoading } = useAuth();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');

    try {
      // TODO: パスワードリセットAPIを実装する必要
      // await authApi.resetPassword(resetEmail);
      setResetMessage('パスワード再設定用のリンクをメールに送信しました。');
    } catch (err) {
      setResetMessage('メール送信に失敗しました。');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(email, password);

      // ロール別の画面遷移
      if (user.role === 'instructor') {
        // トレーナー: 顧客選択画面へ
        navigate(ROUTES.CUSTOMER_SELECT);
      } else if (user.role === 'admin' || user.role === 'staff') {
        // 店長/本部管理者: 統計情報画面へ
        navigate(ROUTES.SHOP_MANAGEMENT);
      } else {
        // その他: デフォルトで統計情報画面へ
        navigate(ROUTES.SHOP_MANAGEMENT);
      }
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
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-white text-sm hover:underline"
              >
                Forgot Password?
              </button>
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

      {/* パスワードリセットモーダル */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#FAF8F3] border border-[#DFDFDF] rounded-2xl p-8 max-w-md w-full mx-4 font-poppins">
            <h3 className="text-2xl font-medium text-gray-800 mb-4">パスワードを忘れた場合</h3>
            <p className="text-gray-600 mb-6">
              登録されたメールアドレスを入力してください。パスワード再設定用のリンクを送信します。
            </p>
            {resetMessage && (
              <div className="mb-4 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-md">
                {resetMessage}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setResetMessage('');
                  }}
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  送信
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

