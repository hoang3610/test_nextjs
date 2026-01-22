import React from 'react';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { BlogPostStatus } from '@/models/BlogPost'; // Assuming we can import the enum or just use string

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  thumbnail_url?: string;
  author: {
    name: string;
  };
  category: {
    name: string;
  };
  status: string;
  views: number;
  createdAt: string;
}

interface TableBlogProps {
  blogs: BlogPost[];
  onView: (blog: BlogPost) => void;
  onEdit: (blog: BlogPost) => void;
  onDelete: (blog: BlogPost) => void;
}

const TableBlog: React.FC<TableBlogProps> = ({
  blogs,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Đã xuất bản</span>;
      case 'DRAFT':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Bản nháp</span>;
      case 'ARCHIVED':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Lưu trữ</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">STT</th>
              <th className="px-6 py-3">Hình ảnh</th>
              <th className="px-6 py-3">Tiêu đề</th>
              <th className="px-6 py-3">Danh mục</th>
              <th className="px-6 py-3">Tác giả</th>
              <th className="px-6 py-3 text-center">Lượt xem</th>
              <th className="px-6 py-3 text-center">Trạng thái</th>
              <th className="px-6 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length > 0 ? (
              blogs.map((blog, index) => (
                <tr key={blog._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                      {blog.thumbnail_url ? (
                        <Image
                          src={blog.thumbnail_url}
                          alt={blog.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate" title={blog.title}>
                    {blog.title}
                  </td>
                  <td className="px-6 py-4">{blog.category?.name || '---'}</td>
                  <td className="px-6 py-4">{blog.author?.name || '---'}</td>
                  <td className="px-6 py-4 text-center">{blog.views}</td>
                  <td className="px-6 py-4 text-center">{getStatusBadge(blog.status)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => onView(blog)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(blog)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(blog)}
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
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Chưa có bài viết nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableBlog;
