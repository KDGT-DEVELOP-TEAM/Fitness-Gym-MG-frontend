import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { getErrorMessage, getAllErrorMessages } from '../../utils/errorMessages';
import { logger } from '../../utils/logger';
import { passwordResetApi } from '../../api/passwordResetApi';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetName, setResetName] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { login, actionLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ログイン成功後の遷移をuseEffectで処理
  useEffect(() => {
    if (user) {
      const redirectPath = (() => {
        switch (user.role) {
          case 'ADMIN':
            return '/admin';
          case 'MANAGER':
            return '/manager';
          case 'TRAINER':
            return '/trainer';
          default:
            return '/login';
        }
      })();
      
      navigate(redirectPath, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // navigateはReact Routerが安定性を保証しているため、依存配列から除外

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // navigate()の呼び出しを削除 - useEffectで処理
    } catch (err) {
      logger.error('Login failed', err, 'Login');
      // バリデーションエラーの場合は詳細メッセージを表示
      const errorMessages = getAllErrorMessages(err);
      if (errorMessages.length > 0) {
        setError(errorMessages.join('\n'));
      } else {
        setError(getErrorMessage(err, 'login'));
      }
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetError('メールアドレスを入力してください');
      return;
    }
    if (!resetName.trim()) {
      setResetError('名前を入力してください');
      return;
    }

    setResetError('');
    setResetLoading(true);

    try {
      await passwordResetApi.createRequest({
        email: resetEmail.trim(),
        name: resetName.trim(),
      });
      setResetSuccess(true);
      logger.info('Password reset request created', { email: resetEmail }, 'Login');
    } catch (err) {
      logger.error('Password reset request failed', err, 'Login');
      const errorMessages = getAllErrorMessages(err);
      if (errorMessages.length > 0) {
        setResetError(errorMessages.join('\n'));
      } else {
        setResetError('リクエストの送信に失敗しました。メールアドレスと名前を確認してください。');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetName('');
    setResetError('');
    setResetSuccess(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3] animate-in fade-in duration-500">
      <div className="w-full max-w-md px-8 py-16 rounded-[2rem] bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 font-poppins">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight text-center mb-12">ログイン</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-2xl text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={actionLoading}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-50 shadow-sm bg-white text-gray-900 focus:outline-none focus:border-green-500 focus:ring-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">パスワード</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={actionLoading}
                className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-50 shadow-sm bg-white text-gray-900 focus:outline-none focus:border-green-500 focus:ring-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={actionLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-right mt-2">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowResetModal(true)}
              >
                パスワードをお忘れですか？
              </button>
            </div>
          </div>
          <div className="pt-8">
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl text-lg font-black text-white bg-[#68BE6B] shadow-md transition-all hover:bg-[#5AA85A] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>
      </div>

      {/* パスワードリセットモーダル */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md px-8 py-16 rounded-[2rem] bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 font-poppins mx-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center mb-6">パスワードリセット</h3>
            {resetSuccess ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-center">
                  パスワードリセットリクエストを受け付けました。
                  <br />
                  管理者が確認後、新しいパスワードを設定します。
                  <br />
                  しばらくお待ちください。
                </p>
                <button
                  type="button"
                  onClick={handleCloseResetModal}
                  className="w-full py-4 rounded-2xl text-lg font-black text-white bg-[#68BE6B] shadow-md transition-all hover:bg-[#5AA85A] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  閉じる
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-600 text-sm text-center">
                  登録されているメールアドレスと名前を入力してください。
                  <br />
                  管理者が確認後、パスワードをリセットします。
                </p>
                {resetError && (
                  <div className="text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-2xl text-sm text-center">
                    {resetError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-black text-gray-600 mb-2">メールアドレス</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetLoading}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-50 shadow-sm bg-white text-gray-900 focus:outline-none focus:border-green-500 focus:ring-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="メールアドレスを入力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-600 mb-2">名前</label>
                  <input
                    type="text"
                    value={resetName}
                    onChange={(e) => setResetName(e.target.value)}
                    disabled={resetLoading}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-50 shadow-sm bg-white text-gray-900 focus:outline-none focus:border-green-500 focus:ring-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="名前を入力"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseResetModal}
                    disabled={resetLoading}
                    className="flex-1 py-3 rounded-2xl text-lg font-black text-gray-700 bg-gray-200 shadow-sm transition-all hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="flex-1 py-3 rounded-2xl text-lg font-black text-white bg-[#68BE6B] shadow-md transition-all hover:bg-[#5AA85A] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? '送信中...' : '送信'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

