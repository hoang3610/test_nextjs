'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// --- Imports ---
import { Table, Column } from '@/components/custom/table';

// --- Type Definition ---
export interface CustomerResponse {
  _id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: string;
  addresses?: {
    province?: { code: string; name: string }; // User Address type might differ, checking later
    district?: { code: string; name: string };
    ward?: { code: string; name: string };
    street_address?: string;
    type?: string;
    isDefault?: boolean;
  }[];
  createdAt?: string;
  // Stats (might be missing in list view, optional)
  order_count?: number;
  last_order_at?: string;
}

// --- Props Interface ---
interface TableCustomerProps {
  data: CustomerResponse[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onView: (customer: CustomerResponse) => void;
}

const TableCustomer: React.FC<TableCustomerProps> = ({
  data = [],
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onView
}) => {
  // --- Columns ---
  const columns: Column<CustomerResponse>[] = [
    {
      header: 'Khách hàng',
      className: 'min-w-[200px]',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 text-sm">{item.full_name}</span>
          <span className="text-xs text-gray-500">{item.email || 'Chưa có email'}</span>
        </div>
      ),
    },
    {
      header: 'Số điện thoại',
      className: 'min-w-[120px]',
      render: (item) => <span className="text-sm text-gray-700 font-mono">{item.phone_number || '-'}</span>
    },
    {
      header: 'Địa chỉ',
      className: 'min-w-[200px]',
      render: (item) => {
        const defaultAddr = item.addresses?.[0]; // Show first address
        if (!defaultAddr) return <span className="text-gray-400 italic text-sm">Chưa có</span>;
        return (
          <div className="text-sm text-gray-600 line-clamp-1" title={[defaultAddr.street_address, defaultAddr.ward?.name].join(', ')}>
            {[
              defaultAddr.street_address,
              defaultAddr.ward?.name,
              defaultAddr.province?.name
            ].filter(Boolean).join(', ')}
          </div>
        )
      }
    },
    {
      header: 'Ngày tham gia',
      className: 'min-w-[150px]',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: vi }) : '-'}
        </span>
      )
    },
    {
      header: 'Hành động',
      className: 'text-right w-[80px]',
      render: (item) => (
        <button
          onClick={() => onView(item)}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Xem chi tiết"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col font-sans bg-gray-50">
      <div className="flex flex-col h-full p-6 gap-6">
        <div className="shrink-0 flex justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Quản lý Khách hàng</h2>
          {/* No Create Button */}
        </div>

        <div className="flex-1 min-h-0">
          <Table<CustomerResponse>
            columns={columns}
            data={data}
            pagination={{
              currentPage,
              totalPages: Math.ceil(totalItems / itemsPerPage) || 1,
              totalItems: totalItems,
              itemsPerPage,
              onPageChange,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TableCustomer;
