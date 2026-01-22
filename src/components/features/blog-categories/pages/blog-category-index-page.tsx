'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { showToast } from '@/components/custom/custom-toast';
import TableBlogCategory from '../components/TableBlogCategory';
import CreateBlogCategory from '../components/CreateBlogCategory';
import EditBlogCategory from '../components/EditBlogCategory';
import ModalConfirmCustom from '@/components/custom/modal-confirm-custom';

const BlogCategoryIndexPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    content: '',
    onConfirm: async () => {},
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/blog-categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.data || []);
      } else {
        showToast({ message: data.error || 'Lỗi tải danh mục', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      showToast({ message: 'Lỗi kết nối', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Handlers ---

  const handleCreate = async (data: any) => {
    const res = await fetch('/api/blog-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
        showToast({ message: 'Tạo danh mục thành công', type: 'success' });
        fetchCategories();
    } else {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi tạo danh mục');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    const res = await fetch(`/api/blog-categories/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

    if (res.ok) {
        showToast({ message: 'Cập nhật thành công', type: 'success' });
        fetchCategories();
    } else {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi cập nhật');
    }
  };

  const confirmDelete = async (category: any) => {
    try {
        const res = await fetch(`/api/blog-categories/${category._id}/delete`);
        if (res.ok) {
            showToast({ message: 'Xóa danh mục thành công', type: 'success' });
            fetchCategories();
        } else {
            const err = await res.json();
            showToast({ message: err.error || 'Lỗi xóa danh mục', type: 'error' });
        }
    } catch (e) {
        showToast({ message: 'Lỗi kết nối', type: 'error' });
    } finally {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  // --- Button Actions ---

  const openCreateModal = () => setIsCreateOpen(true);

  const openViewModal = (category: any) => {
    setSelectedCategory(category);
    setIsViewMode(true);
    setIsEditOpen(true);
  };

  const openEditModal = (category: any) => {
    setSelectedCategory(category);
    setIsViewMode(false);
    setIsEditOpen(true);
  };

  const openDeleteModal = (category: any) => {
    setConfirmModal({
        isOpen: true,
        title: 'Xóa Danh Mục',
        content: `Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?`,
        onConfirm: () => confirmDelete(category)
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Danh Mục Blog</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Thêm mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : (
        <TableBlogCategory
          categories={categories}
          onView={openViewModal}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      )}

      {/* Modals */}
      <CreateBlogCategory
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
      />
      
      {selectedCategory && (
        <EditBlogCategory
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedCategory(null);
          }}
          onSave={handleUpdate}
          categoryData={selectedCategory}
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

export default BlogCategoryIndexPage;
