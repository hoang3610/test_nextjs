import React from 'react';
import { Metadata } from 'next';

import BlogCategoryIndexPage from '@/components/features/blog-categories/pages/blog-category-index-page';

export const metadata: Metadata = {
  title: 'Quản lý Danh mục Blog | Admin Dashboard',
  description: 'Trang quản lý danh mục bài viết blog.',
};

const BlogCategoryManagementPage = () => {
  return (
    <div className="w-full">
      <BlogCategoryIndexPage />
    </div>
  );
};

export default BlogCategoryManagementPage;