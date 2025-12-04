import React from 'react';
import { Customer } from '../../types/customer';

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <h3 className="font-semibold text-lg">{customer.name}</h3>
      {customer.email && <p className="text-sm text-gray-600 mt-1">{customer.email}</p>}
      {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
    </div>
  );
};

