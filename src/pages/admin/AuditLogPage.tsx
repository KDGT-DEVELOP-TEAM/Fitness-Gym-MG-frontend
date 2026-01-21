import React, { useState, useEffect, useMemo } from 'react';
import { adminLogsApi } from '../../api/admin/logsApi';
import { MAX_PAGE_SIZE } from '../../constants/pagination';
import { AuditLog } from '../../types/admin/log';
import { LoadingRow, EmptyRow } from '../../components/common/TableStatusRows';
import { Pagination } from '../../components/common/Pagination';
import { formatDateTimeSplit } from '../../utils/dateFormatter';
import { logger } from '../../utils/logger';

const ITEMS_PER_PAGE = 10;

// アクション名の日本語化（レッスン関連のみ）
const getActionLabel = (action: string): string => {
  switch (action.toUpperCase()) {
    case 'CREATE':
      return 'レッスン作成';
    case 'UPDATE':
      return 'レッスン履歴の編集';
    case 'DELETE':
      return 'レッスン履歴の削除';
    default:
      return action;
  }
};

export const AuditLogPage: React.FC = () => {
  const [allLogs, setAllLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // レッスン関連のログのみをフィルタリング（大文字小文字を区別しない）
  const filteredLogs = allLogs.filter(log => 
    log.targetTable && log.targetTable.toLowerCase() === 'lessons'
  );
  
  // ページネーション用のログ（フィルタリング後のログをページ分割）
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 日付フォーマットをメモ化
  const formattedLogs = useMemo(() => {
    return paginatedLogs.map(log => {
      const { dateStr, timeStr } = formatDateTimeSplit(log.createdAt);
      return { ...log, dateStr, timeStr } as AuditLog & { dateStr: string; timeStr: string };
    });
  }, [paginatedLogs]);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        // バックエンドの最大ページサイズを使用
        // 複数ページに分けて取得する必要がある場合は、後で改善
        const response = await adminLogsApi.getLogs({
          page: 0,
          size: MAX_PAGE_SIZE, // バックエンドのApplicationConstants.MAX_PAGE_SIZEと一致
        });
        // response.dataが配列
        const logsData = response.data || [];
        
        // デバッグ: 取得したログの内容を確認
        logger.debug('Fetched audit logs', { count: logsData.length }, 'AuditLogPage');
        if (logsData.length > 0) {
          logger.debug('First log details', { 
            firstLog: logsData[0],
            targetTable: logsData[0].targetTable,
            allTargetTables: logsData.map(log => log.targetTable)
          }, 'AuditLogPage');
        } else {
          logger.warn('No audit logs found', {}, 'AuditLogPage');
        }
        
        setAllLogs(logsData);
        
        // フィルタリング後の件数を計算（大文字小文字を区別しない比較）
        const lessonLogs = logsData.filter(log => 
          log.targetTable && log.targetTable.toLowerCase() === 'lessons'
        );
        logger.debug('Filtered lesson logs', { count: lessonLogs.length }, 'AuditLogPage');
        const filteredCount = lessonLogs.length;
        setTotal(filteredCount);
        setTotalPages(Math.ceil(filteredCount / ITEMS_PER_PAGE) || 1);
      } catch (err: any) {
        logger.error('Failed to fetch audit logs', err, 'AuditLogPage');
        setError(err.response?.data?.message || '監査ログの取得に失敗しました。');
        setAllLogs([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">監査ログ</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-bold text-green-600">{total}</span> 件のログが記録されています
          </p>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100">
          ⚠️ エラーが発生しました: {error}
        </div>
      )}

      {/* 監査ログ一覧テーブル */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y table-fixed divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[25%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">日時</th>
                <th className="w-[25%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ユーザー名</th>
                <th className="w-[25%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">顧客名</th>
                <th className="w-[25%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                <LoadingRow colSpan={4} />
              ) : !formattedLogs || formattedLogs.length === 0 ? (
                <EmptyRow colSpan={4} message="レッスン関連のログが登録されていません" />
              ) : (
                formattedLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-green-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center text-center">
                          <span className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {log.dateStr}
                          </span>
                          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider mt-0.5">
                            {log.timeStr}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center items-center">
                          <span className="text-sm font-bold text-gray-600">
                            {log.userName || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center text-center">
                          <span className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {log.customerName || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {(() => {
                          const actionLabel = getActionLabel(log.action);
                          let className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ';
                          if (actionLabel === 'レッスン作成') {
                            className += 'text-green-600 bg-green-50';
                          } else if (actionLabel === 'レッスン履歴の編集') {
                            className += 'text-blue-600 bg-blue-50';
                          } else if (actionLabel === 'レッスン履歴の削除') {
                            className += 'text-red-600 bg-red-50';
                          } else {
                            className += 'text-gray-600 bg-gray-50';
                          }
                          return (
                            <span className={className}>
                              {actionLabel}
                            </span>
                          );
                        })()}
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
    </div>
  );
};

export default AuditLogPage;
