import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface Category {
  name: string;
  imageUrl: string;
}

interface CategorySectionProps {
  title: string;
  categories: Category[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, categories }) => {
  return (
    <section className="py-12">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <Link 
          href="/products" 
          className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Xem tất cả &rarr;
        </Link>
      </div>

      {/* Grid Categories */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {categories.map((category) => (
          <Link 
            href={`/products?category=${encodeURIComponent(category.name)}`} 
            key={category.name} 
            className="group text-center"
          >
            {/* Image Container: Cần có 'relative' để Image fill hoạt động */}
            <div className="relative w-full h-32 sm:h-40 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <Image 
                src={category.imageUrl} 
                alt={category.name} 
                fill // Thay thế cho w-full h-full, ảnh sẽ tràn khung cha
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                // sizes giúp browser tải ảnh kích thước phù hợp (tối ưu hiệu năng)
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
              />
            </div>
            
            <h3 className="mt-4 text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;