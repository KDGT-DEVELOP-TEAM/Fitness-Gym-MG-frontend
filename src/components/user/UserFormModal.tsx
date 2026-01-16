import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import UserForm from './UserForm';
import { User, UserRequest } from '../../types/api/user'; 
import { Store } from '../../types/store';
import { useAuth } from '../../context/AuthContext'; 

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: User; 
  stores: Store[]; 
  onSubmit: (data: UserRequest) => Promise<void>; 
  onDelete: (userId: string) => Promise<void>;
  isSubmitting: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ 
  isOpen, onClose, initialData, stores, onSubmit, onDelete, isSubmitting 
}) => {
  const { user: authUser } = useAuth();
  
  // モーダルが開いている時、背景のスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // クリーンアップ: コンポーネントがアンマウントされる時も元に戻す
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSafeClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return createPortal(
    <div onClick={handleSafeClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {!isSubmitting && (
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 z-10 p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className="p-10">
          <h2 className="text-2xl font-black text-gray-900 mb-8">{initialData ? 'ユーザー情報の編集' : '新規ユーザーの登録'}</h2>

          <UserForm 
            initialData={initialData}
            stores={stores} 
            onSubmit={async (requestData) => {
                await onSubmit(requestData);
                onClose();
            }}
            onDelete={async (id) => {
                await onDelete(id);
                onClose();
            }}
            isSubmitting={isSubmitting}
            currentUserRole={authUser?.role}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserFormModal;