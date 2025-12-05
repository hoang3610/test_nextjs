'use client';

import React from 'react';
import { Plus } from 'lucide-react';

// --- Imports ---
import { Table, Column } from '../../../custom/table';
import { ActionButtons } from '../../../custom/action-button';
import { Category } from '../data/categories';

// --- Props Interface ---
interface TableCategoryProps {
  categories: Category[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
}

const TableCategory: React.FC<TableCategoryProps> = ({
  categories = [],
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onCreate,
  onView,
  onEdit,
}) => {
  // --- Helpers ---
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  // --- Columns ---
  const columns: Column<Category>[] = [
    {
      header: 'Sản phẩm',
      className: 'min-w-[250px]',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Code',
      className: 'min-w-[120px]',
      render: (item) => <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{item.code}</p>
          </div>
        </div>
    },
    {
      header: 'Hành động',
      className: 'text-right w-[120px]',
      render: (item) => <ActionButtons onView={() => onView(item)} onEdit={() => onEdit(item)}/>,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans">
      <div className="flex flex-col h-full p-6 gap-6">
        <div className="shrink-0 flex justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Quản lý Danh mục sản phẩm</h2>
          <button onClick={onCreate} className="bg-[#1462B0] text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} /> Thêm mới
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <Table<Category>
            columns={columns}
            data={categories}
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

export default TableCategory;