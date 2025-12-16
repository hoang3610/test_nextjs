'use client'; // 1. Bắt buộc vì dùng useState và useSearchParams

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // 2. Thay thế useLocation
import FilterSidebar, { type Filters } from '@/components/features/products/FilterSidebar'; // Nhớ check lại đường dẫn import

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

  // Sync state with URL params on navigation
  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    const searchParam = searchParams.get('search') || '';

    setFilters(prev => {
      // Only update if changed to avoid infinite loops if setFilters triggers something else
      if (prev.category === categoryParam && prev.searchTerm === searchParam) return prev;
      return {
        ...prev,
        category: categoryParam,
        searchTerm: searchParam
      };
    });
  }, [searchParams]);

  // State
  const [products, setProducts] = useState<any[]>([]); // Use appropriate type if possible
  const [isLoading, setIsLoading] = useState(false);

  // Fetch logic
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('limit', '20'); // Fetch more items
        params.append('is_active', 'true');

        if (filters.searchTerm) {
          params.append('search', filters.searchTerm);
        }

        // Pass category slug to API
        if (filters.category) {
          params.append('category', filters.category);
        }

        // const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1212';
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();

        if (res.ok) {
          const mappedProducts = data.data.map((item: any) => ({
            id: item._id,
            name: item.name,
            slug: item.slug,
            price: item.skus?.[0]?.price || 0, // Fallback price
            imageUrl: item.thumbnail_url || 'https://placehold.co/400',
            isNew: Math.random() > 0.8, // Mock logic for UI
            isFlashSale: Math.random() > 0.9, // Mock logic for UI
          }));

          // Client-side filtering for Category Name matching if strictly needed or just use results
          // Since API `search` applies to name, let's rely on that + client refine if needed.
          // Actually, let's just set the products.

          // Re-apply client filter if API doesn't support "category name" filter exactly?
          // filters.category matches name?
          // API now handles category filtering
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Filter Sidebar (Left) */}
      <FilterSidebar filters={filters} setFilters={setFilters} />

      {/* Products Grid (Right) */}
      <div className="flex-1">
        {isLoading ? (
          <div className="text-center py-20">Đang tải sản phẩm...</div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                Không tìm thấy sản phẩm nào phù hợp.
              </div>
            )}
          </div>
        )}
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