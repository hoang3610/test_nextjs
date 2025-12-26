'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// --- Imports ---
import { Table, Column } from '@/components/custom/table';
import { GuestResponse } from '../models/response';

// --- Props Interface ---
interface TableGuestProps {
  data: GuestResponse[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onView: (guest: GuestResponse) => void;
}

const TableGuest: React.FC<TableGuestProps> = ({
  data = [],
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onView
}) => {
  // --- Columns ---
  const columns: Column<GuestResponse>[] = [
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
      render: (item) => <span className="text-sm text-gray-700 font-mono">{item.phone_number}</span>
    },
    {
      header: 'Địa chỉ mặc định',
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
      header: 'Đơn hàng',
      className: 'min-w-[100px] text-center',
      render: (item) => (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
          {item.order_count}
        </span>
      )
    },
    {
      header: 'Lần cuối mua',
      className: 'min-w-[150px]',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {item.last_order_at ? format(new Date(item.last_order_at), 'dd/MM/yyyy HH:mm', { locale: vi }) : '-'}
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
          <h2 className="text-xl font-bold text-gray-800">Quản lý Khách hàng vãng lai</h2>
          {/* No Create Button */}
        </div>

        <div className="flex-1 min-h-0">
          <Table<GuestResponse>
            columns={columns}
            data={data}
            pagination={{
              currentPage,
              totalPages: Math.ceil(totalItems / itemsPerPage),
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

export default TableGuest;
