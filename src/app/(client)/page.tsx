import { Metadata } from 'next';
import { mockProducts } from '@/components/features/products/data/products'; // Sử dụng alias @ cho gọn
import ProductSection from '@/components/features/products/ProductSection';
import CategorySection from '@/components/features/products/CategorySection';
import { CategoryClient } from '@/components/features/categories/models/request';
import { Button } from '@/components/ui/button';

// 1. Cấu hình SEO cho trang chủ
export const metadata: Metadata = {
  title: 'HoangGia Shop | Phong cách của bạn',
  description: 'Chuyên cung cấp quần áo, phụ kiện thời trang chính hãng.',
};

// 2. Fetch data from API
async function getData(): Promise<CategoryClient[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/categories?limit=6&is_active=true&sort_order=asc`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }

    const json = await res.json();
    return json.data.map((item: any) => ({
      id: item._id,
      name: item.name,
      slug: item.slug,
      is_active: item.is_active,
      image_url: item.image_url,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// 3. Server Component (Async function)
export default async function HomePage() {
  const categories = await getData();

  // Vì là Server Component chạy 1 lần, ta lọc trực tiếp không cần useMemo
  const newProducts = mockProducts.filter(p => p.isNew);
  const featuredProducts = mockProducts.filter(p => p.isFeatured);
  const flashSaleProducts = mockProducts.filter(p => p.isFlashSale);

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700 pb-20">

      {/* Hero Banner */}
      <div className="bg-blue-900 text-center py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          HoangGia Shop
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
          Phong cách của bạn, lựa chọn của chúng tôi.
        </p>
      </div>

      {/* Danh mục */}
      <div className="container mx-auto px-4">
        {categories.length > 0 && (
          <CategorySection title="Danh mục nổi bật" categories={categories} />
        )}
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