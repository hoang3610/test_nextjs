'use client';

import React from 'react';
import { Plus } from 'lucide-react';

// --- Imports ---
import { Table, Column } from '../../../custom/table';
import { ActionButtons } from '../../../custom/action-button';
import { Category } from '../models'; // Import shared model

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
  onDelete: (category: Category) => void;
  onChangeStatus: (category: Category) => void;
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
  onDelete,
  onChangeStatus
}) => {
  // --- Columns ---
  const columns: Column<Category>[] = [
    {
      header: 'Tên danh mục',
      className: 'min-w-[250px]',
      render: (item) => (
        <div className="flex items-center gap-3">
          <img src={item.image_url || 'https://placehold.co/40'} alt={item.name} className="w-10 h-10 rounded object-cover bg-gray-100" />
          <div>
            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Slug', // Changed from "Mã danh mục"
      className: 'min-w-[120px]',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{item.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      className: 'min-w-[120px]',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {item.is_active ? 'Hoạt động' : 'Ẩn'}
        </span>
      ),
    },
    {
      header: 'Hành động',
      className: 'text-right w-[120px]',
      render: (item) => <ActionButtons onView={() => onView(item)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} onChangeStatus={() => onChangeStatus(item)} />,
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