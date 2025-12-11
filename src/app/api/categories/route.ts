import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';


// Helpers
const createSlug = (name: string) => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100'); // Default high limit for dropdowns
        const search = searchParams.get('search') || '';
        const parent_id = searchParams.get('parent_id');
        const is_active = searchParams.get('is_active');

        const query: any = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (parent_id) {
            query.parent_id = parent_id === 'null' ? null : parent_id;
        }

        if (is_active !== null) {
            query.is_active = is_active === 'true';
        }

        const skip = (page - 1) * limit;

        const categories = await Category.find(query)
            .populate('parent_id', 'name slug')
            .skip(skip)
            .limit(limit)
            .sort({ sort_order: 1, createdAt: -1 });

        const total = await Category.countDocuments(query);

        return NextResponse.json({
            data: categories,
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

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic validation
        if (!body.name) {
            return NextResponse.json(
                { error: 'Missing required field: name' },
                { status: 400 }
            );
        }

        // Auto-generate slug if not provided
        const slug = body.slug ? body.slug : createSlug(body.name);

        // Ensure slug is unique
        let uniqueSlug = slug;
        let counter = 1;
        while (await Category.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        const categoryData = {
            ...body,
            slug: uniqueSlug,
        };





        const category = await Category.create(categoryData);

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Duplicate key error (slug must be unique)' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
