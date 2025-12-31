import React from 'react';
import { Customer, CustomerRequest } from '../../types/api/customer';
import { CustomerForm } from './CustomerForm';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Customer;
  onSubmit: (data: CustomerRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, initialData, onSubmit, onDelete, isSubmitting }) => {
  if (!isOpen) return null;

  const handleSafeClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
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
          <h2 className="text-2xl font-black text-gray-900 mb-8">{initialData ? '顧客情報の編集' : '新規顧客の登録'}</h2>
          <CustomerForm initialData={initialData} onSubmit={onSubmit} onDelete={onDelete} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
};