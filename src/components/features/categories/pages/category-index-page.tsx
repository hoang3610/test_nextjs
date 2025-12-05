'use client';

import React, { useState, useMemo } from 'react';

// --- Imports ---
import Createcategory from '../components/CreateCategory';
import Editcategory from '../components/EditCategory';
import { Category, CategoryPayload } from '../data/categories';
import TableCategory from '../components/TableCategory';
import CreateCategory from '../components/CreateCategory';

// --- Mock Data ---
const initialCategories: Category[] = [
  {
    id: 1,
    name: 'Áo',
    code: `A1`,
    is_app_visible: true
  },
  {
    id: 2,
    name: 'Quần',
    code: `A1`,
    is_app_visible: false,
    description: "Quần dài"
  },
  {
    id: 3,
    name: 'Váy',
    code: `A1`,
    is_app_visible: true
  }
  // ... more mock data if needed
];

const CategoryIndexPage = () => {
  // --- State ---
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Partial<Category> | null>(null);
  const [isViewMode, setViewMode] = useState(false);
  const itemsPerPage = 2;

  // --- Handlers ---
  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleSaveNewCategory = (newCategory: CategoryPayload) => {
    const fullCategory: Category = {
      id: Date.now(), 
      name: newCategory.name || '',
      code: newCategory.code || '',
      description: newCategory.description || '',
      is_app_visible: newCategory.is_app_visible === 1,
    } as Category;
    setCategories([fullCategory, ...categories]);
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setViewMode(true);
    setEditModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setViewMode(false);
    setEditModalOpen(true);
  };

  const handleSaveEditedCategory = (editedCategory: CategoryPayload) => {
    setCategories(categories.map((p) => (p.id === editedCategory.id ? { ...p, ...editedCategory, is_app_visible: editedCategory.is_app_visible === 1 } : p)));
  };

  const paginatedCategories = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return categories.slice(startIndex, startIndex + itemsPerPage);
    }, [categories, currentPage, itemsPerPage]);

  const handleCloseModals = () => {
    setCreateModalOpen(false);
    // setEditModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <>
      <TableCategory
          categories={paginatedCategories}
          currentPage={currentPage}
          totalItems={categories.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onCreate={handleCreate}
          onView={handleView}
          onEdit={handleEdit}
        />
      <CreateCategory
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveNewCategory}
      />
      {selectedCategory && (
        <Editcategory
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSave={handleSaveEditedCategory}
          categoryData={selectedCategory}
          isViewMode={isViewMode}
        />
      )}
    </>
  );
};

export default CategoryIndexPage;