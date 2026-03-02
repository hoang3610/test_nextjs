"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NewBlogsWidget = () => {
    const [blogs, setBlogs] = useState<any[]>([]);

    useEffect(() => {
        const fetchNewBlogs = async () => {
            try {
                // Fetch recent blogs, limit 5, sorting by createdAt desc (default in API)
                const res = await fetch('/api/blogs?limit=5&status=PUBLISHED');
                const data = await res.json();
                if (res.ok) {
                    setBlogs(data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch new blogs', error);
            }
        };
        fetchNewBlogs();
    }, []);

    if (blogs.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 mt-8">
            <h3 className="text-lg font-bold text-pink-500 mb-4 border-b pb-2">Bài viết mới</h3>
            <div className="space-y-4">
                {blogs.map((blog) => (
                    <div key={blog._id} className="flex gap-3 items-start group">
                        <Link href={`/blogs/${blog.slug}`} className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                            <Image
                                src={blog.thumbnail_url || 'https://placehold.co/150'}
                                alt={blog.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform"
                            />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                <Link href={`/blogs/${blog.slug}`}>
                                    {blog.title}
                                </Link>
                            </h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewBlogsWidget;
