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

import PromotionItem from '@/models/PromotionItem';

import mongoose from 'mongoose';

// POST: Tạo chiến dịch khuyến mãi mới
export async function POST(request: Request) {
    const session = await mongoose.startSession();
    try {
        await dbConnect();
        session.startTransaction();

        const body = await request.json();

        // Tách items ra khỏi body để không insert vào Promotion (vì không có trường này trong Schema Promotion)
        const { items, ...promotionData } = body;

        // Check trùng tên
        const existingPromotion = await Promotion.findOne({ name: promotionData.name }).session(session);
        if (existingPromotion) {
            await session.abortTransaction();
            return NextResponse.json(
                { error: 'Promotion name already exists' },
                { status: 400 }
            );
        }

        // Validate cơ bản
        if (!promotionData.name || !promotionData.start_at || !promotionData.end_at) {
            await session.abortTransaction();
            return NextResponse.json(
                { error: 'Missing required fields: name, start_at, end_at' },
                { status: 400 }
            );
        }

        // Validate thời gian
        if (new Date(promotionData.start_at) >= new Date(promotionData.end_at)) {
            await session.abortTransaction();
            return NextResponse.json(
                { error: 'End time must be after start time' },
                { status: 400 }
            );
        }

        // Validate items: Bắt buộc phải có ít nhất 1 sản phẩm
        if (!items || !Array.isArray(items) || items.length === 0) {
            await session.abortTransaction();
            return NextResponse.json(
                { error: 'Promotion must have at least one item' },
                { status: 400 }
            );
        }

        // 1. Tạo Promotion (truyền session vào)
        // create return array if passed array or single doc if passed object.
        // But with session, better to use array format [doc] or use new Promotion(doc).save({ session })
        // Alternatively, Model.create([doc], { session }) returns array.
        // Or Model.create(doc, { session }) might not work in older Mongoose versions as expected for single doc?
        // Let's use array syntax for safety with transaction: await Model.create([doc], { session: session });
        const [promotion] = await Promotion.create([promotionData], { session });

        // 2. Tạo Promotion Items (nếu có)
        if (items && Array.isArray(items) && items.length > 0) {
            const promotionItems = items.map((item: any) => ({
                ...item,
                promotion_id: promotion._id,
            }));

            await PromotionItem.insertMany(promotionItems, { session });
        }

        await session.commitTransaction();
        return NextResponse.json(promotion, { status: 201 });

    } catch (error: any) {
        await session.abortTransaction();
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    } finally {
        session.endSession();
    }
}
