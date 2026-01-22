import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import '@/models/User';
import '@/models/BlogCategory';

// GET: List Blogs (Filter, Search, Pagination)
export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        
        // Filters
        const status = searchParams.get('status');
        const category_id = searchParams.get('category_id');
        const is_featured = searchParams.get('is_featured');
        const author_id = searchParams.get('author_id');

        const query: any = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (status) {
            query.status = status;
        }

        if (category_id) {
            query.category_id = category_id;
        }

        if (author_id) {
            query.author_id = author_id;
        }

        if (is_featured !== null) {
            query.is_featured = is_featured === 'true';
        }

        const skip = (page - 1) * limit;

        const blogs = await BlogPost.find(query)
            .populate('category_id', 'name slug')
            .populate('author_id', 'full_name avatar_url')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await BlogPost.countDocuments(query);

        return NextResponse.json({
            data: blogs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// POST: Create New Blog
export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Inject Author
        body.author_id = session.user.id;

        // Basic Validation
        if (!body.title || !body.slug || !body.category_id) {
            return NextResponse.json(
                { error: 'Missing required fields: title, slug, category_id' },
                { status: 400 }
            );
        }

        // Check Slug Duplication
        const existingBlog = await BlogPost.findOne({ slug: body.slug });
        if (existingBlog) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            );
        }

        const blog = await BlogPost.create(body);

        return NextResponse.json(blog, { status: 201 });

    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Duplicate key error' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
