
import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import User from '@/models/User'; // Ensure model registration
import BlogCategory from '@/models/BlogCategory'; // Ensure model registration
import NewProductsWidget from '@/components/features/products/components/NewProductsWidget';
import NewBlogsWidget from '@/components/features/blogs/components/NewBlogsWidget';
import 'react-quill-new/dist/quill.snow.css'; // For content styling

interface BlogDetailPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
    await dbConnect();
    const { slug } = await params;
    
    // Decode slug if it contains special characters (though usually slugs are URL safe)
    const decodedSlug = decodeURIComponent(slug);

    const blog = await BlogPost.findOne({ slug: decodedSlug, status: 'PUBLISHED' }).select('title excerpt meta_title meta_description thumbnail_url');

    if (!blog) {
        return {
            title: 'Bài viết không tồn tại',
        };
    }

    return {
        title: blog.meta_title || blog.title,
        description: blog.meta_description || blog.excerpt || '',
        openGraph: {
            title: blog.meta_title || blog.title,
            description: blog.meta_description || blog.excerpt || '',
            images: blog.thumbnail_url ? [blog.thumbnail_url] : [],
        },
    };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
    await dbConnect();
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Fetch Blog
    const blog = await BlogPost.findOne({ slug: decodedSlug, status: 'PUBLISHED' })
        .populate('author_id', 'full_name avatar_url')
        .populate('category_id', 'name slug')
        .lean();

    if (!blog) {
        notFound();
    }

    // Transform _id to string for serialization if needed (though we use it directly in server component)
    const blogData = JSON.parse(JSON.stringify(blog));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content (3/4) */}
                <div className="lg:col-span-3">
                    {/* Breadcrumb (Basic) */}
                    <div className="text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-blue-600">Trang chủ</Link> 
                        <span className="mx-2">/</span>
                        <Link href="/blogs" className="hover:text-blue-600">Blog</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800">{blogData.title}</span>
                    </div>

                    {/* Meta Header */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{blogData.title}</h1>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b pb-4">
                        <div className="flex items-center gap-2">
                             {/* Author Avatar Override or Default */}
                             <div className="w-8 h-8 relative rounded-full overflow-hidden bg-gray-200">
                                <Image 
                                    src={blogData.author_id?.avatar_url || 'https://placehold.co/100'} 
                                    alt={blogData.author_id?.full_name || 'Author'}
                                    fill
                                    className="object-cover"
                                />
                             </div>
                             <span className="font-medium text-gray-700">{blogData.author_id?.full_name || 'Admin'}</span>
                        </div>
                        <span>•</span>
                        <span>{format(new Date(blogData.createdAt), 'dd/MM/yyyy', { locale: vi })}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            {blogData.view_count || 0} lượt xem
                        </span>
                    </div>

                    {/* Thumbnail */}
                    {blogData.thumbnail_url && (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 shadow-sm">
                            <Image 
                                src={blogData.thumbnail_url} 
                                alt={blogData.title} 
                                fill 
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 800px"
                                priority
                            />
                        </div>
                    )}

                    {/* Content */}
                    <article className="prose prose-lg prose-blue max-w-none dark:prose-invert">
                        <div 
                             className="ql-editor" // Reuse Quill styles
                             style={{ padding: 0 }}
                             dangerouslySetInnerHTML={{ __html: blogData.content }} 
                        />
                    </article>

                    {/* Tags */}
                    {blogData.tags && blogData.tags.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-2">
                            {blogData.tags.map((tag: string, idx: number) => (
                                <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar (1/4) */}
                <div className="lg:col-span-1 space-y-8">
                    <NewBlogsWidget />
                    <NewProductsWidget />
                </div>
            </div>
        </div>
    );
}
