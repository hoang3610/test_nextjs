"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // 1. Thay thế react-router-dom
import FilterSidebar, { type Filters } from '@/components/features/products/FilterSidebar'; // Ví dụ đường dẫn import
import { mockProducts } from '@/components/features/products/data/products';
import ProductCard from '@/components/features/products/ProductCard';

// 2. Tách logic chính ra thành một component con
const ProductContent = () => {
  // 3. Sử dụng hook của Next.js để lấy query param (?category=...)
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    category: initialCategory,
  });

  // Logic lọc sản phẩm giữ nguyên
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
            <p className="text-center col-span-full text-gray-500">Không tìm thấy sản phẩm nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Component chính của Page
const ProductIndexPage = () => {
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

      {/* 5. Quan trọng: Bọc Suspense để tránh lỗi build khi dùng useSearchParams */}
      <Suspense fallback={<div className="text-center">Đang tải sản phẩm...</div>}>
        <ProductContent />
      </Suspense>
    </div>
  );
};

export default ProductIndexPage;