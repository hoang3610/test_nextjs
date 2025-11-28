import { Metadata } from 'next';
import { mockProducts } from '@/components/features/products/data/products'; // Sử dụng alias @ cho gọn
import ProductSection from '@/components/features/products/ProductSection';
import CategorySection, { type Category } from '@/components/features/products/CategorySection';
import { Button } from '@/components/ui/button';

// 1. Cấu hình SEO cho trang chủ
export const metadata: Metadata = {
  title: 'HoangGia Shop | Phong cách của bạn',
  description: 'Chuyên cung cấp quần áo, phụ kiện thời trang chính hãng.',
};

// Mock data cho danh mục
const categories: Category[] = [
  { name: 'Áo Thun', imageUrl: 'https://picsum.photos/id/211/400/400' },
  { name: 'Quần Jeans', imageUrl: 'https://picsum.photos/id/212/400/400' },
  { name: 'Giày Sneaker', imageUrl: 'https://picsum.photos/id/213/400/400' },
  { name: 'Balo', imageUrl: 'https://picsum.photos/id/214/400/400' },
  { name: 'Đồng Hồ', imageUrl: 'https://picsum.photos/id/215/400/400' },
  { name: 'Áo Khoác', imageUrl: 'https://picsum.photos/id/216/400/400' },
];

// 2. Server Component (Async function)
export default async function HomePage() {
  // Vì là Server Component chạy 1 lần, ta lọc trực tiếp không cần useMemo
  const newProducts = mockProducts.filter(p => p.isNew);
  const featuredProducts = mockProducts.filter(p => p.isFeatured);
  const flashSaleProducts = mockProducts.filter(p => p.isFlashSale);

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700 pb-20">
      
      {/* Hero Banner */}
      <div className="text-center py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          HoangGia Shop
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
          Phong cách của bạn, lựa chọn của chúng tôi.
        </p>
        <Button variant="destructive">Xóa dữ liệu</Button>
      </div>

      {/* Danh mục */}
      <div className="container mx-auto px-4">
        <CategorySection title="Danh mục nổi bật" categories={categories} />
      </div>

      {/* Các Product Section */}
      <div className="container mx-auto px-4 space-y-10">
        {featuredProducts.length > 0 && (
          <ProductSection title="Sản phẩm nổi bật" products={featuredProducts} />
        )}
        
        {newProducts.length > 0 && (
          <ProductSection title="Sản phẩm mới" products={newProducts} />
        )}
        
        {flashSaleProducts.length > 0 && (
          <ProductSection title="Flash Sale" products={flashSaleProducts} />
        )}
      </div>
    </div>
  );
}