"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NewProductsWidget = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=5&sort=-createdAt&is_active=true');
        const data = await res.json();
        if (res.ok) {
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch new products', error);
      }
    };
    fetchNewProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <h3 className="text-lg font-bold text-pink-500 mb-4 border-b pb-2">Sản phẩm mới</h3>
      <div className="space-y-4">
        {products.map((product) => {
             const price = product.skus?.[0]?.price || 0;
             const originalPrice = product.skus?.[0]?.original_price || 0; 
             
             return (
              <div key={product._id} className="flex gap-3 items-start group">
                <Link href={`/products/${product.slug}`} className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                   <Image
                      src={product.thumbnail_url || 'https://placehold.co/150'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                   />
                </Link>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                    <Link href={`/products/${product.slug}`}>
                      {product.name}
                    </Link>
                  </h4>
                  <div className="flex flex-col">
                    <span className="text-red-500 font-bold text-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                    </span>
                    {originalPrice > price && (
                       <span className="text-gray-400 text-xs line-through">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                       </span>
                    )}
                  </div>
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default NewProductsWidget;
