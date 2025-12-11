'use client';

import React, { useState, useEffect, useCallback } from 'react';

// --- Imports ---
import Createcategory from '../components/CreateCategory';
import Editcategory from '../components/EditCategory';
import TableCategory from '../components/TableCategory';
import ModalConfirmCustom from '@/components/custom/modal-confirm-custom';
import { Category } from '../models'; // Import shared model
import { CategoryRequest } from '../models/request';

import { showToast } from '@/components/custom/custom-toast';
import { uploadImageClient } from '@/lib/cloudinary-client';

const CategoryIndexPage = () => {
  // --- State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isViewMode, setViewMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'DELETE' | 'CHANGE_STATUS' | null;
    category: Category | null;
    title: string;
    content: string;
  }>({
    isOpen: false,
    type: null,
    category: null,
    title: '',
    content: '',
  });

  const itemsPerPage = 10; // Default limit

  // --- Data Fetching ---
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/categories?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        // Map API data to our Frontend Interface
        const mappedCategories: Category[] = data.data.map((item: any) => ({
          id: item._id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          is_active: item.is_active,
          image_url: item.image_url || 'https://placehold.co/40', // Fallback image
          parent_id: item.parent_id
        }));

        setCategories(mappedCategories);
        setTotalItems(data.pagination.total);
      } else {
        console.error("Failed to fetch categories:", data.error);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Helper: Fetch Detail ---
  const fetchCategoryDetail = async (id: string): Promise<Category | null> => {
    try {
      const response = await fetch(`/api/categories/${id}/detail`);
      const data = await response.json();

      if (response.ok) {
        // Map API response to Frontend Interface
        return {
          id: data._id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          is_active: data.is_active,
          image_url: data.image_url,
          // parent_id handling if needed
        };
      } else {
        console.error("Failed to fetch category detail:", data.error);
        alert("Không thể lấy thông tin chi tiết danh mục.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching category detail:", error);
      alert("Lỗi kết nối khi lấy chi tiết danh mục.");
      return null;
    }
  };

  // --- Handlers ---
  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleSaveNewCategory = async (newCategory: CategoryRequest) => {
    try {
      setIsLoading(true);
      // Upload image first
      if (newCategory.image_url) {
        newCategory.image_url = await uploadImageClient(newCategory.image_url, 'ecommerce_categories');
      }

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({ message: "Tạo danh mục thành công!", type: "success" })
        // Success
        setCreateModalOpen(false);
        fetchCategories(); // Refresh data
      } else {
        showToast({ message: `Lỗi khi tạo danh mục: ${data.error}`, type: "error" })
      }
    } catch (error) {
      console.error("Error creating category:", error);
      showToast({ message: "Đã xảy ra lỗi khi tạo danh mục.", type: "error" })
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (category: Category) => {
    // Optimistic set from table
    setSelectedCategory(category);
    setViewMode(true);
    setEditModalOpen(true);

    // Update with fresh data
    const detailedCategory = await fetchCategoryDetail(category.id);
    if (detailedCategory) {
      setSelectedCategory(detailedCategory);
    }
  };

  const handleEdit = async (category: Category) => {
    // Optimistic set from table
    setSelectedCategory(category);
    setViewMode(false);
    setEditModalOpen(true);

    // Update with fresh data
    const detailedCategory = await fetchCategoryDetail(category.id);
    if (detailedCategory) {
      setSelectedCategory(detailedCategory);
    }
  };

  const handleDelete = (category: Category) => {
    setConfirmModal({
      isOpen: true,
      type: 'DELETE',
      category: category,
      title: 'Xóa danh mục',
      content: `Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?`,
    });
  };

  const handleChangeStatus = (category: Category) => {
    setConfirmModal({
      isOpen: true,
      type: 'CHANGE_STATUS',
      category: category,
      title: 'Thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn thay đổi trạng thái danh mục "${category.name}" không?`,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.category || !confirmModal.type) return;

    const { type, category } = confirmModal;

    try {
      if (type === 'DELETE') {
        const response = await fetch(`/api/categories/${category.id}/delete`);
        if (response.ok) {
          showToast({ message: "Xóa danh mục thành công!", type: "success" });
          fetchCategories();
        } else {
          const data = await response.json();
          showToast({ message: `Xóa danh mục thất bại: ${data.error}`, type: "error" });
        }
      } else if (type === 'CHANGE_STATUS') {
        const newStatus = !category.is_active; // Toggle status
        const response = await fetch(`/api/categories/${category.id}/change-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_active: newStatus }),
        });
        if (response.ok) {
          showToast({ message: "Thay đổi trạng thái danh mục thành công!", type: "success" });
          fetchCategories();
        } else {
          const data = await response.json();
          showToast({ message: `Thay đổi trạng thái danh mục thất bại: ${data.error}`, type: "error" });
        }
      }
    } catch (error) {
      console.error(`Error ${type === 'DELETE' ? 'deleting' : 'changing status'} category:`, error);
      showToast({ message: `Có lỗi xảy ra khi ${type === 'DELETE' ? 'xóa' : 'thay đổi trạng thái'} danh mục.`, type: "error" });
    } finally {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleSaveEditedCategory = async (editedCategory: CategoryRequest & { id?: string }) => {
    if (!editedCategory.id) {
      alert("Lỗi: Không tìm thấy ID danh mục cần sửa.");
      return;
    }

    try {
      setIsLoading(true);
      // Upload image first
      if (editedCategory.image_url) {
        editedCategory.image_url = await uploadImageClient(editedCategory.image_url, 'ecommerce_categories');
      }

      const response = await fetch(`/api/categories/${editedCategory.id}/update`, {
        method: 'POST', // User requested behavior/Existing API method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedCategory),
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        setEditModalOpen(false);
        fetchCategories(); // Refresh data
        showToast({ message: "Cập nhật danh mục thành công!", type: "success" })
      } else {
        showToast({ message: `Lỗi khi cập nhật: ${data.error}`, type: "error" })
      }
    } catch (error) {
      console.error("Error updating category:", error);
      showToast({ message: "Đã xảy ra lỗi khi cập nhật danh mục.", type: "error" })
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModals = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <>
      <TableCategory
        categories={categories}
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onCreate={handleCreate}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChangeStatus={handleChangeStatus}
      />

      <Createcategory
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveNewCategory}
      />
      {selectedCategory && (
        <Editcategory
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSave={handleSaveEditedCategory}
          categoryData={selectedCategory as any}
          isViewMode={isViewMode}
        />
      )}

      <ModalConfirmCustom
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        titleModal={confirmModal.title}
        content={confirmModal.content}
        typeIcon="warning"
      />
    </>
  );
};

export default CategoryIndexPage;