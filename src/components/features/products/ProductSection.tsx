import React from 'react';
import Link from 'next/link'; // 1. Thay thế react-router-dom
import { type Product } from '@/types'; // Dùng alias @ nếu có thể
import ProductCard from './ProductCard'; // Import component con

interface ProductSectionProps {
  title: string;
  products: Product[];
  // Số lượng sản phẩm muốn hiển thị
  limit?: number;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, products, limit = 4 }) => {
  // Logic cắt mảng giữ nguyên
  const displayedProducts = products.slice(0, limit);

  return (
    <section className="py-12">
      {/* Header của section */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        
        {/* 2. Đổi 'to' thành 'href' */}
        <Link 
          href="/products" 
          className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Xem thêm &rarr;
        </Link>
      </div>

      {/* Grid sản phẩm */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {displayedProducts.map((product) => (
          // ProductCard (Client Component) được render bên trong Server Component này
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;