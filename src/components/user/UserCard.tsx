import React from 'react';
import { User } from '../../types/user';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  // ロール名の日本語マッピング
  const roleLabels: { [key: string]: string } = {
    admin: '管理者',
    manager: '店長',
    trainer: 'トレーナー',
  };

  return (
    <tr className="hover:bg-green-50/30 transition-colors group">
      {/* 1. ユーザー名 */}
      <td className="px-8 py-6">
        <div className="flex flex-col items-center text-center">
          <span className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
            {user.name}
          </span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
            {user.kana}
          </span>
        </div>
      </td>

      {/* 2. 権限ロール */}
      <td className="px-8 py-6 text-center">
        <span className={`px-4 py-1 text-xs font-black uppercase rounded-full tracking-widest ${
          user.role === 'admin' ? 'bg-red-100 text-red-700' :
          user.role === 'manager' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {roleLabels[user.role] || user.role}
        </span>
      </td>

      {/* 3. ステータス */}
      <td className="px-8 py-6 text-center">
        <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase ${
          user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
        }`}>
          {user.isActive ? '有効' : '無効'}
        </span>
      </td>

      {/* 4. 編集ボタン */}
      <td className="px-8 py-6">
        <div className="flex justify-center">
          <button 
            onClick={() => onEdit(user)} 
            className="inline-flex items-center gap-2 px-5 py-2 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all font-bold text-sm border border-green-50 shadow-sm hover:shadow-green-100 active:scale-95"
          >
            <span>編集</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};