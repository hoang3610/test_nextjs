import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Guest from '@/models/Guest';

export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const guests = await Guest.find({})
            .sort({ order_count: -1, last_order_at: -1 }) // Prioritize loyal & recent customers
            .skip(skip)
            .limit(limit);

        const total = await Guest.countDocuments({});

        return NextResponse.json({
            success: true,
            data: guests,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Error fetching guests:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch guests', error: error.message },
            { status: 500 }
        );
    }
}
