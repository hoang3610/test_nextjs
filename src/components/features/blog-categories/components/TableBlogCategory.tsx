import React from 'react';
import { Edit2, Eye, Trash2 } from 'lucide-react';

interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  description?: string;
  createdAt: string;
}

interface TableBlogCategoryProps {
  categories: BlogCategory[];
  onView: (category: BlogCategory) => void;
  onEdit: (category: BlogCategory) => void;
  onDelete: (category: BlogCategory) => void;
}

const TableBlogCategory: React.FC<TableBlogCategoryProps> = ({
  categories,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">STT</th>
              <th className="px-6 py-3">Tên Danh Mục</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3 text-center">Thứ tự</th>
              <th className="px-6 py-3 text-center">Trạng thái</th>
              <th className="px-6 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <tr key={category._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4">{category.slug}</td>
                  <td className="px-6 py-4 text-center">{category.sort_order}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.is_active ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => onView(category)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(category)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(category)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Chưa có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableBlogCategory;
