'use client';

import React from 'react';
import { Plus } from 'lucide-react';

// --- Imports ---
import { Table, Column } from '../../../custom/table';
import { ActionButtons } from '../../../custom/action-button';
import { ProductResponse as Product, ProductSkuResponse as ProductSku } from '../models/response/product';


// --- Props Interface ---
interface TableProductProps {
  products: Product[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onChangeStatus: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
}

const TableProduct: React.FC<TableProductProps> = ({
  products = [],
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
  onToggleFeatured,
}) => {
  // --- Helpers ---
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  // --- Columns ---
  const columns: Column<Product>[] = [
    {
      header: 'Sản phẩm',
      className: 'min-w-[250px]',
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.thumbnail_url || 'https://placehold.co/40'}
            alt={item.name}
            className="w-10 h-10 rounded object-cover bg-gray-100"
          />
          <div>
            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
            {/* Display first SKU as a representative if available */}
            <p className="text-xs text-gray-500">{item.skus?.[0]?.sku}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Giá bán',
      className: 'min-w-[120px]',
      render: (item) => {
        // Display price of first SKU or a range if variants exist? 
        // For simplicity, showing first SKU price
        const price = item.skus?.[0]?.price || 0;
        return <div className="font-medium text-gray-700">{formatCurrency(price)}</div>;
      },
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
      header: 'Nổi bật',
      className: 'min-w-[100px] text-center',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFeatured(item);
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${item.is_featured ? 'bg-green-600' : 'bg-gray-200'
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.is_featured ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
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
          <h2 className="text-xl font-bold text-gray-800">Quản lý sản phẩm</h2>
          <button onClick={onCreate} className="bg-[#1462B0] text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} /> Thêm mới
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <Table<Product>
            columns={columns}
            data={products}
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

export default TableProduct;