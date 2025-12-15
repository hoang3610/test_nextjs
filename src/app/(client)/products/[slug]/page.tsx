import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailPage from '@/components/features/products/pages/product-detail-page';

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    await dbConnect();
    const { slug } = await params;
    const product = await Product.findOne({ slug }).select('name description thumbnail_url').lean();

    if (!product) {
        return {
            title: 'Sản phẩm không tồn tại',
        };
    }

    return {
        title: product.name,
        description: product.description?.substring(0, 160),
        openGraph: {
            images: [product.thumbnail_url || ''],
        },
    };
}

const ProductPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    await dbConnect();
    const { slug } = await params;

    // Fetch product by slug
    const product = await Product.findOne({ slug, is_active: true }).lean();

    if (!product) {
        notFound();
    }

    // Serializable simple object (convert _id to string)
    const serializableProduct = {
        ...product,
        _id: product._id.toString(),
        category_id: product.category_id?.toString(),
        brand_id: product.brand_id?.toString(),
        skus: product.skus?.map((sku: any) => ({
            ...sku,
            _id: sku._id?.toString(),
            attributes: sku.attributes?.map((attr: any) => ({
                ...attr,
                _id: attr._id?.toString(),
            })),
        })),
        attributes_summary: product.attributes_summary?.map((attr: any) => ({
            ...attr,
            _id: attr._id?.toString(),
        })),
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
    };

    return <ProductDetailPage product={serializableProduct} />;
};

export default ProductPage;
