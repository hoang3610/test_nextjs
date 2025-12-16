'use client'; // 1. Bắt buộc: Vì dùng hook và event handler

import React, { useState, useEffect } from 'react';
import Link from 'next/link';   // 2. Thay thế react-router-dom
import Image from 'next/image'; // 3. Component ảnh tối ưu của Next.js
import { useCart } from '@/hooks/useCart'; // Nên dùng alias @ thay cho ../../../
// Giả sử bạn đã định nghĩa type Product ở đâu đó
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    // It ensures that client-specific rendering (like price formatting)
    // happens after the initial server render, avoiding a hydration mismatch.
    setIsMounted(true);
  }, []);

  // Format tiền Việt Nam
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg shadow-md bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">

      {/* Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        {/* Dùng fill: Ảnh sẽ tự tràn đầy khung cha (cha phải có relative + height cụ thể)
           sizes: Giúp trình duyệt tải ảnh kích thước phù hợp với màn hình
        */}
        <Image
          src={product.imageUrl || 'https://placehold.co/600'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isNew && (
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              Mới
            </span>
          )}
          {product.isFlashSale && (
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white animate-pulse shadow-sm">
              Sale
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center bg-black/40 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20">
          <button
            onClick={(e) => {
              e.preventDefault(); // Ngăn click nhầm vào Link sản phẩm
              addToCart(product);
            }}
            className="rounded-full bg-white px-6 py-2 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-200 hover:scale-105 active:scale-95"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 text-center">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white truncate" title={product.name}>
          {/* Link bao quanh tên sản phẩm */}
          <Link href={`/products/${product.slug}`} className="hover:text-blue-600 transition-colors">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
          {/* 
            Conditionally render the price only on the client-side after mounting.
            This prevents a hydration mismatch between the server and client,
            as locale-specific formatting can differ between environments.
          */}
          {isMounted ? formatPrice(product.price) : '...'}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;