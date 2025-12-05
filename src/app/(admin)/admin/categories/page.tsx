import React from 'react';
import { Metadata } from 'next';

import CategoryIndexPage from '@/components/features/categories/pages/category-index-page';

export const metadata: Metadata = {
  title: 'Quản lý Danh mục Sản phẩm| Admin Dashboard',
  description: 'Trang quản lý danh mục sản phẩm.',
};

const CategoryManagementPage = () => {
  return (
    <div className="w-full">
      <CategoryIndexPage />
    </div>
  );
};

export default CategoryManagementPage;