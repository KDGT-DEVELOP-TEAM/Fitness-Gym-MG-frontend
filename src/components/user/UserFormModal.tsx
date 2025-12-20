import React from 'react';
import UserForm from './UserForm';
import { User, UserFormData } from '../../types/user';
import { Store } from '../../types/store'; 

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: User; 
  stores: Store[]; 
  onSubmit: (data: UserFormData, userId?: string) => Promise<void>; 
  onDelete: (userId: string) => Promise<void>;
  isSubmitting: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ 
  isOpen, onClose, initialData, stores, onSubmit, onDelete, isSubmitting 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-10 md:p-12">
          <header className="mb-10 space-y-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {initialData ? 'ユーザー情報の編集' : '新規ユーザーの登録'}
            </h2>
          </header>

          <UserForm 
            initialData={initialData}
            stores={stores} 
            onSubmit={async (data, id) => {
                await onSubmit(data, id);
                onClose();
            }}
            onDelete={async (id) => {
                await onDelete(id);
                onClose();
            }}
            isSubmitting={isSubmitting} 
          />
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;