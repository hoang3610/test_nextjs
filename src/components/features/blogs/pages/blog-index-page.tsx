'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { showToast } from '@/components/custom/custom-toast';
import TableBlog from '../components/TableBlog';
import CreateBlog from '../components/CreateBlog';
import EditBlog from '../components/EditBlog';
import ModalConfirmCustom from '@/components/custom/modal-confirm-custom';

const BlogIndexPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, page: 1, pages: 1 });

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    content: '',
    onConfirm: async () => {},
  });

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/blogs?page=${currentPage}&limit=10`); // Default limit 10
      const data = await res.json();
      if (res.ok) {
        setBlogs(data.data || []);
        setPagination(data.pagination);
      } else {
        showToast({ message: data.error || 'Lỗi tải bài viết', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      showToast({ message: 'Lỗi kết nối', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/blog-categories?is_active=true');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [fetchBlogs]);

  // --- Handlers ---

  const handleCreate = async (data: any) => {
    const res = await fetch('/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
        showToast({ message: 'Đăng bài thành công', type: 'success' });
        fetchBlogs();
    } else {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi đăng bài');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    const res = await fetch(`/api/blogs/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

    if (res.ok) {
        showToast({ message: 'Cập nhật thành công', type: 'success' });
        fetchBlogs();
    } else {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi cập nhật');
    }
  };

  const confirmDelete = async (blog: any) => {
    try {
        const res = await fetch(`/api/blogs/${blog._id}/delete`);
        if (res.ok) {
            showToast({ message: 'Xóa bài viết thành công', type: 'success' });
            fetchBlogs();
        } else {
            const err = await res.json();
            showToast({ message: err.error || 'Lỗi xóa bài viết', type: 'error' });
        }
    } catch (e) {
        showToast({ message: 'Lỗi kết nối', type: 'error' });
    } finally {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  // --- Button Actions ---

  const openCreateModal = () => setIsCreateOpen(true);

  const openViewModal = (blog: any) => {
    setSelectedBlog(blog);
    setIsViewMode(true);
    setIsEditOpen(true);
  };

  const openEditModal = (blog: any) => {
    setSelectedBlog(blog);
    setIsViewMode(false);
    setIsEditOpen(true);
  };

  const openDeleteModal = (blog: any) => {
    setConfirmModal({
        isOpen: true,
        title: 'Xóa Bài Viết',
        content: `Bạn có chắc chắn muốn xóa bài viết "${blog.title}" không?`,
        onConfirm: () => confirmDelete(blog)
    });
  };

  // Pagination Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
        setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Bài Viết</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Viết bài mới
        </button>
      </div>

      {loading && blogs.length === 0 ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : (
        <>
            <TableBlog
            blogs={blogs}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            />
            {/* Simple Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        Trước
                    </button>
                    <span className="px-3 py-1">Trang {pagination.page} / {pagination.pages}</span>
                    <button
                        disabled={pagination.page === pagination.pages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        Sau
                    </button>
                </div>
            )}
        </>
      )}

      {/* Modals */}
      <CreateBlog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
        categories={categories}
      />
      
      {selectedBlog && (
        <EditBlog
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedBlog(null);
          }}
          onSave={handleUpdate}
          blogData={selectedBlog}
          categories={categories}
          isViewMode={isViewMode}
        />
      )}

      <ModalConfirmCustom
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        titleModal={confirmModal.title}
        content={confirmModal.content}
        typeIcon="warning"
      />
    </div>
  );
};

export default BlogIndexPage;
