import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category'; // Ensure model is registered
import '@/models/Brand';    // Ensure model is registered

// Example: Get products created in the last 7 days
// GET /api/products/is-new?limit=10&days=7

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const days = parseInt(searchParams.get('days') || '7');

        // Calculate the date "days" ago
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        // Find products created AFTER this dateLimit
        // Query: createdAt >= dateLimit AND is_active = true
        const products = await Product.find({
            is_active: true,
            createdAt: { $gte: dateLimit }
        })
            .sort({ createdAt: -1 }) // Newest first
            .limit(limit)
            .populate('category_id', 'name slug')
            .populate('brand_id', 'name')
            .lean();

        return NextResponse.json({
            data: products
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}