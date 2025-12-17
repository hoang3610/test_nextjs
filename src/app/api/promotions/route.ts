import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Promotion from '@/models/Promotion';

// GET: Lấy danh sách khuyến mãi (có phân trang & search)
export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');

        const query: any = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const promotions = await Promotion.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Promotion.countDocuments(query);

        return NextResponse.json({
            data: promotions,
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

// POST: Tạo chiến dịch khuyến mãi mới
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Validate cơ bản
        if (!body.name || !body.start_at || !body.end_at) {
            return NextResponse.json(
                { error: 'Missing required fields: name, start_at, end_at' },
                { status: 400 }
            );
        }

        // Validate thời gian
        if (new Date(body.start_at) >= new Date(body.end_at)) {
            return NextResponse.json(
                { error: 'End time must be after start time' },
                { status: 400 }
            );
        }

        const promotion = await Promotion.create(body);

        return NextResponse.json(promotion, { status: 201 });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
