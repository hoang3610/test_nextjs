'use client'; // 1. Bắt buộc vì dùng useState và useSearchParams

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // 2. Thay thế useLocation
import FilterSidebar, { type Filters } from '@/components/features/products/FilterSidebar'; // Nhớ check lại đường dẫn import
import { mockProducts } from '@/components/features/products/data/products';
import ProductCard from '@/components/features/products/ProductCard';

// 3. Tách phần logic chính ra component con
const ProductContent = () => {
  // Thay thế useQuery tự viết bằng hook chuẩn của Next.js
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    category: initialCategory,
  });

  // Logic lọc sản phẩm (Giữ nguyên)
  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesCategory = filters.category === '' || product.name.includes(filters.category);
      return matchesSearch && matchesCategory;
    });
  }, [filters]);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Filter Sidebar (Left) */}
      <FilterSidebar filters={filters} setFilters={setFilters} />

      {/* Products Grid (Right) */}
      <div className="flex-1">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              Không tìm thấy sản phẩm nào phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Component chính (Page)
const ProductIndexPage: React.FC = () => {
  return (
    <div className="py-12 container mx-auto px-4">
      {/* Page Title */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Sản phẩm
        </h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Khám phá những sản phẩm mới nhất và tốt nhất.
        </p>
      </div>

      {/* 5. QUAN TRỌNG: Bọc Suspense để tránh lỗi build khi dùng useSearchParams */}
      <Suspense fallback={<div className="text-center py-20">Đang tải danh sách sản phẩm...</div>}>
        <ProductContent />
      </Suspense>
    </div>
  );
};

export default ProductIndexPage;