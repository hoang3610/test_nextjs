import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category'; // Ensure model is registered
import '@/models/Brand';    // Ensure model is registered


export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const category_id = searchParams.get('category_id');
        const brand_id = searchParams.get('brand_id');
        const is_active = searchParams.get('is_active');

        const query: any = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category_id) {
            query.category_id = category_id;
        }

        if (brand_id) {
            query.brand_id = brand_id;
        }

        if (is_active !== null) {
            query.is_active = is_active === 'true';
        }

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .populate('category_id', 'name')
            .populate('brand_id', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        return NextResponse.json({
            data: products,
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
        if (!body.name || !body.slug || !body.category_id) {
            return NextResponse.json(
                { error: 'Missing required fields: name, slug, category_id' },
                { status: 400 }
            );
        }

        // Check if slug exists
        const existingProduct = await Product.findOne({ slug: body.slug });
        if (existingProduct) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            );
        }

        const product = await Product.create(body);

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        // Handle duplicate key error specifically if needed, though slug check covers most
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