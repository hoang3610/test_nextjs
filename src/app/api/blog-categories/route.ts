import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogCategory from '@/models/BlogCategory';

// GET: List Categories
export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        
        // Simple filters
        const is_active = searchParams.get('is_active');
        
        const query: any = {};
        if (is_active !== null) {
            query.is_active = is_active === 'true';
        }

        // Listing all categories (usually not many, so no pagination needed yet, but can add if needed)
        const categories = await BlogCategory.find(query).sort({ sort_order: 1, createdAt: -1 });

        return NextResponse.json({
            data: categories
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// POST: Create Category
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        if (!body.name || !body.slug) {
            return NextResponse.json(
                { error: 'Missing required fields: name, slug' },
                { status: 400 }
            );
        }

        const existing = await BlogCategory.findOne({ slug: body.slug });
        if (existing) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            );
        }

        const category = await BlogCategory.create(body);

        return NextResponse.json(category, { status: 201 });

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
