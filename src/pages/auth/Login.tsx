import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { getErrorMessage, getAllErrorMessages } from '../../utils/errorMessages';
import { logger } from '../../utils/logger';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { login, actionLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ログイン成功後の遷移をuseEffectで処理
  useEffect(() => {
    console.log('[Login] useEffect発火、user:', user);
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
      
      console.log('[Login] ユーザー状態更新を検知、リダイレクト:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // navigateはReact Routerが安定性を保証しているため、依存配列から除外

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      console.log('[Login] ログイン試行開始');
      await login(email, password);
      console.log('[Login] ログイン成功、ユーザーデータの設定を待機中');
      // navigate()の呼び出しを削除 - useEffectで処理
    } catch (err) {
      console.error('[Login] ログインエラー:', err);
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

    setResetError('');
    setResetLoading(true);

    try {
      // パスワードリセット機能は現在バックエンドで実装されていません
      // TODO: バックエンドに実装が追加されたら、authApi.resetPassword()を呼び出す
      logger.warn('Password reset not implemented', { email: resetEmail }, 'Login');
      setResetError('パスワードリセット機能は現在利用できません。管理者にお問い合わせください。');
    } catch (err) {
      logger.error('Password reset failed', err, 'Login');
      setResetError('パスワードリセットメールの送信に失敗しました。メールアドレスを確認してください。');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
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
                className="text-white text-sm hover:underline"
                onClick={() => setShowResetModal(true)}
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
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md px-8 py-16 rounded-3xl bg-login-card font-poppins mx-4">
            <h3 className="text-3xl font-normal text-white text-center mb-6">パスワードリセット</h3>
            {resetSuccess ? (
              <div className="space-y-4">
                <p className="text-white text-center">
                  パスワードリセット用のメールを送信しました。
                  <br />
                  メール内のリンクからパスワードを再設定してください。
                </p>
                <button
                  type="button"
                  onClick={handleCloseResetModal}
                  className="w-full py-4 rounded-lg text-white text-xl font-normal bg-login-button transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  閉じる
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-white text-sm text-center">
                  登録されているメールアドレスを入力してください。
                  <br />
                  パスワードリセット用のリンクを送信します。
                </p>
                {resetError && (
                  <div className="text-white bg-red-500 bg-opacity-20 px-4 py-2 rounded-md text-sm text-center">
                    {resetError}
                  </div>
                )}
                <div>
                  <label className="block text-white text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetLoading}
                    className="w-full px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="メールアドレスを入力"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseResetModal}
                    disabled={resetLoading}
                    className="flex-1 py-3 rounded-lg text-white text-lg font-normal bg-gray-500 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="flex-1 py-3 rounded-lg text-white text-lg font-normal bg-login-button transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

