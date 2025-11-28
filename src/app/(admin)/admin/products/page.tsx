import React from 'react';
import { Metadata } from 'next';

import ProductIndexPage from '@/components/features/products/pages/product-index-page';

export const metadata: Metadata = {
  title: 'Quản lý Sản phẩm | Admin Dashboard',
  description: 'Trang quản lý danh sách sản phẩm, kho hàng và giá cả.',
};

const ProductManagementPage = () => {
  return (
    <div className="w-full">
      <ProductIndexPage />
    </div>
  );
};

export default ProductManagementPage;