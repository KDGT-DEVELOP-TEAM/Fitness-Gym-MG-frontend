import React, { useState, useEffect } from 'react';
import { passwordResetApi } from '../../api/passwordResetApi';
import { PasswordResetRequestResponse } from '../../types/passwordReset';
import { LoadingRow, EmptyRow } from '../../components/common/TableStatusRows';
import { Pagination } from '../../components/common/Pagination';
import { formatDateTimeSplit } from '../../utils/dateFormatter';
import { logger } from '../../utils/logger';
import { getErrorMessage, getAllErrorMessages } from '../../utils/errorMessages';

const ITEMS_PER_PAGE = 10;

export const PasswordResetRequestPage: React.FC = () => {
  const [requests, setRequests] = useState<PasswordResetRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequestResponse | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      // フロントエンドは1ベース、バックエンドは0ベース
      const response = await passwordResetApi.getRequests({
        page: page - 1,
        size: ITEMS_PER_PAGE,
      });
      setRequests(response.data);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE) || 1);
      logger.debug('Fetched password reset requests', { 
        count: response.data.length, 
        total: response.total,
        page: response.page,
      }, 'PasswordResetRequestPage');
    } catch (err: any) {
      logger.error('Failed to fetch password reset requests', err, 'PasswordResetRequestPage');
      const errorMessages = getAllErrorMessages(err);
      setError(errorMessages.length > 0 ? errorMessages.join('\n') : 'リクエストの取得に失敗しました。');
      setRequests([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    if (!newPassword.trim()) {
      setPasswordError('新しいパスワードを入力してください');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('パスワードは8文字以上で入力してください');
      return;
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(newPassword)) {
      setPasswordError('パスワードは英字と数字を含めてください');
      return;
    }

    setPasswordError('');
    setActionLoading(true);

    try {
      await passwordResetApi.approveRequest({
        requestId: selectedRequest.id,
        newPassword,
        note: approvalNote || undefined,
      });
      logger.info('Password reset request approved', { requestId: selectedRequest.id }, 'PasswordResetRequestPage');
      setShowApprovalModal(false);
      setNewPassword('');
      setApprovalNote('');
      setSelectedRequest(null);
      await fetchRequests(currentPage);
    } catch (err: any) {
      logger.error('Failed to approve password reset request', err, 'PasswordResetRequestPage');
      const errorMessages = getAllErrorMessages(err);
      setPasswordError(errorMessages.length > 0 ? errorMessages.join('\n') : '承認に失敗しました。');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);

    try {
      await passwordResetApi.rejectRequest({
        requestId: selectedRequest.id,
        note: rejectionNote || undefined,
      });
      logger.info('Password reset request rejected', { requestId: selectedRequest.id }, 'PasswordResetRequestPage');
      setShowRejectionModal(false);
      setRejectionNote('');
      setSelectedRequest(null);
      await fetchRequests(currentPage);
    } catch (err: any) {
      logger.error('Failed to reject password reset request', err, 'PasswordResetRequestPage');
      const errorMessages = getAllErrorMessages(err);
      setError(errorMessages.length > 0 ? errorMessages.join('\n') : '拒否に失敗しました。');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);

    try {
      await passwordResetApi.deleteRequest(selectedRequest.id);
      logger.info('Password reset request deleted', { requestId: selectedRequest.id }, 'PasswordResetRequestPage');
      setShowDeleteConfirm(false);
      setSelectedRequest(null);
      await fetchRequests(currentPage);
    } catch (err: any) {
      logger.error('Failed to delete password reset request', err, 'PasswordResetRequestPage');
      const errorMessages = getAllErrorMessages(err);
      setError(errorMessages.length > 0 ? errorMessages.join('\n') : '削除に失敗しました。');
    } finally {
      setActionLoading(false);
    }
  };

  const openApprovalModal = (request: PasswordResetRequestResponse) => {
    setSelectedRequest(request);
    setNewPassword('');
    setApprovalNote('');
    setPasswordError('');
    setShowApprovalModal(true);
  };

  const openRejectionModal = (request: PasswordResetRequestResponse) => {
    setSelectedRequest(request);
    setRejectionNote('');
    setShowRejectionModal(true);
  };

  const openDeleteConfirm = (request: PasswordResetRequestResponse) => {
    setSelectedRequest(request);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">リクエスト</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-bold text-green-600">{total}</span> 件の未処理リクエスト
          </p>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100">
          ⚠️ エラーが発生しました: {error}
        </div>
      )}

      {/* リクエスト一覧テーブル */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y table-fixed divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[20%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">リクエスト日時</th>
                <th className="w-[20%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">メールアドレス</th>
                <th className="w-[20%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">名前</th>
                <th className="w-[20%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">照合状態</th>
                <th className="w-[20%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                <LoadingRow colSpan={5} />
              ) : requests.length === 0 ? (
                <EmptyRow colSpan={5} message="未処理のリクエストがありません" />
              ) : (
                requests.map((request) => {
                  const { dateStr, timeStr } = formatDateTimeSplit(request.requestedAt);
                  const isMatched = request.userId != null;
                  return (
                    <tr key={request.id} className="hover:bg-green-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center text-center">
                          <span className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {dateStr}
                          </span>
                          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider mt-0.5">
                            {timeStr}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center items-center">
                          <span className="text-sm font-bold text-gray-600">
                            {request.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center items-center">
                          <span className="text-sm font-bold text-gray-600">
                            {request.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {isMatched ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50">
                            照合済み
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50">
                            未照合
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center items-center gap-2">
                          {isMatched && (
                            <button
                              onClick={() => openApprovalModal(request)}
                              className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              承認
                            </button>
                          )}
                          <button
                            onClick={() => openRejectionModal(request)}
                            className="px-4 py-2 text-sm font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            拒否
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(request)}
                            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* 承認モーダル */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md px-8 py-8 rounded-[2rem] bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 mx-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center mb-6">パスワードリセット承認</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">メールアドレス</label>
                <p className="text-sm text-gray-900">{selectedRequest.email}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">名前</label>
                <p className="text-sm text-gray-900">{selectedRequest.name}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">新しいパスワード <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  disabled={actionLoading}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-50 shadow-sm bg-white text-gray-900 focus:outline-none focus:border-green-500 focus:ring-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="新しいパスワードを入力"
                />
                {passwordError && (
                  <p className="text-sm text-red-600 mt-1">{passwordError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">8文字以上、英字と数字を含めてください</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">メモ（任意）</label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  disabled={actionLoading}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-50 shadow-sm bg-white text-gray-900 focus:outline-none focus:border-green-500 focus:ring-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="メモを入力（任意）"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setNewPassword('');
                    setApprovalNote('');
                    setPasswordError('');
                    setSelectedRequest(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl text-lg font-black text-gray-700 bg-gray-200 shadow-sm transition-all hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl text-lg font-black text-white bg-green-600 shadow-md transition-all hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? '処理中...' : '承認'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 拒否モーダル */}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md px-8 py-8 rounded-[2rem] bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 mx-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center mb-6">パスワードリセット拒否</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">メールアドレス</label>
                <p className="text-sm text-gray-900">{selectedRequest.email}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">名前</label>
                <p className="text-sm text-gray-900">{selectedRequest.name}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">理由（任意）</label>
                <textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  disabled={actionLoading}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-50 shadow-sm bg-white text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="拒否理由を入力（任意）"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionNote('');
                    setSelectedRequest(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl text-lg font-black text-gray-700 bg-gray-200 shadow-sm transition-all hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl text-lg font-black text-white bg-orange-600 shadow-md transition-all hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? '処理中...' : '拒否'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && selectedRequest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md px-8 py-8 rounded-[2rem] bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 mx-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center mb-6">リクエスト削除</h3>
            <div className="space-y-4">
              <p className="text-gray-600 text-center">
                このリクエストを削除してもよろしいですか？
                <br />
                この操作は取り消せません。
              </p>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">メールアドレス</label>
                <p className="text-sm text-gray-900">{selectedRequest.email}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">名前</label>
                <p className="text-sm text-gray-900">{selectedRequest.name}</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedRequest(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl text-lg font-black text-gray-700 bg-gray-200 shadow-sm transition-all hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl text-lg font-black text-white bg-red-600 shadow-md transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? '削除中...' : '削除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordResetRequestPage;
