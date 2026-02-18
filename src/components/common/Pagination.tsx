import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevClick = () => {
    onPageChange(Math.max(currentPage - 1, 1));
  };

  const handleNextClick = () => {
    onPageChange(Math.min(currentPage + 1, totalPages));
  };

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-3">
        <button
          onClick={handlePrevClick}
          disabled={currentPage === 1}
          className="h-10 px-6 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          PREV
        </button>
        <button
          onClick={handleNextClick}
          disabled={currentPage === totalPages}
          className="h-10 px-6 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          NEXT
        </button>
      </div>
    </div>
  );
};
