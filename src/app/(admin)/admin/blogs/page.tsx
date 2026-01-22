import React from 'react';
import { Metadata } from 'next';

import BlogIndexPage from '@/components/features/blogs/pages/blog-index-page';

export const metadata: Metadata = {
  title: 'Quản lý Bài viết | Admin Dashboard',
  description: 'Trang quản lý bài viết blog.',
};

const BlogManagementPage = () => {
  return (
    <div className="w-full">
      <BlogIndexPage />
    </div>
  );
};

export default BlogManagementPage;
