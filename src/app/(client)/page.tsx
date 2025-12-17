import { Metadata } from 'next';
import { mockProducts } from '@/components/features/products/data/products'; // Sử dụng alias @ cho gọn
import ProductSection from '@/components/features/products/ProductSection';
import CategorySection from '@/components/features/products/CategorySection';
import { CategoryClient } from '@/components/features/categories/models/request';
import { Button } from '@/components/ui/button';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product'; // Import Product model
import '@/models/Brand'; // Import Brand model for population return
import { unstable_noStore as noStore } from 'next/cache';

// 1. Cấu hình SEO cho trang chủ
export const metadata: Metadata = {
  title: 'HoangGia Shop | Phong cách của bạn',
  description: 'Chuyên cung cấp quần áo, phụ kiện thời trang chính hãng.',
};

// 2. Fetch data from API
// 2. Fetch data directly from DB (Server Component pattern)
async function getData(): Promise<CategoryClient[]> {
  noStore(); // Opt out of static rendering if needed, or rely on revalidate
  await dbConnect();

  try {
    const categories = await Category.find({ is_active: true })
      .sort({ sort_order: 1 })
      .limit(6)
      .lean();

    // Map to plain object
    return categories.map((item: any) => ({
      id: item._id.toString(),
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

// 2b. Fetch New Products (Server Logic)
async function getNewProducts(days: number = 7, limit: number = 4) {
  try {
    noStore();
    await dbConnect();

    // Logic: Created within last 'days'
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const products = await Product.find({
      is_active: true,
      createdAt: { $gte: dateLimit }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category_id', 'name slug')
      .lean();

    return JSON.parse(JSON.stringify(products)).map((item: any) => ({
      id: item._id,
      name: item.name,
      slug: item.slug,
      price: item.skus?.[0]?.price || 0,
      originalPrice: item.skus?.[0]?.original_price || undefined,
      imageUrl: item.thumbnail_url || item.image_urls?.[0] || '',
      isNew: true,
      isFeatured: false,
      isFlashSale: false,
    }));
  } catch (error) {
    console.error('Error fetching new products:', error);
    return [];
  }
}

// 2c. Fetch Featured Products (Server Logic)
async function getFeaturedProducts(limit: number = 4) {
  try {
    noStore();
    await dbConnect();

    const products = await Product.find({
      is_active: true,
      is_featured: true
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('category_id', 'name slug')
      .lean();

    return JSON.parse(JSON.stringify(products)).map((item: any) => ({
      id: item._id,
      name: item.name,
      slug: item.slug,
      price: item.skus?.[0]?.price || 0,
      originalPrice: item.skus?.[0]?.original_price || undefined,
      imageUrl: item.thumbnail_url || item.image_urls?.[0] || '',
      isNew: false,
      isFeatured: true,
      isFlashSale: false,
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// 3. Server Component (Async function)
export default async function HomePage() {
  const categories = await getData();
  const newProducts = await getNewProducts(7, 4);
  const featuredProducts = await getFeaturedProducts(4);

  // Mock data for other sections (for now)
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