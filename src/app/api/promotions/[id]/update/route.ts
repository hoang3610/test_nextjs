import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Promotion from '@/models/Promotion';
import PromotionItem from '@/models/PromotionItem';
import mongoose from 'mongoose';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const session = await mongoose.startSession();
    try {
        await dbConnect();
        session.startTransaction();

        const params = await props.params;
        const { id } = params;
        const body = await request.json();
        const { items, ...promotionData } = body;

        // Validate items if present and not empty array check if intended
        if (items !== undefined && (!Array.isArray(items) || items.length === 0)) {
            await session.abortTransaction();
            return NextResponse.json(
                { error: 'Promotion must have at least one item' },
                { status: 400 }
            );
        }

        // Validate dates if present
        if (promotionData.start_at && promotionData.end_at) {
            if (new Date(promotionData.start_at) >= new Date(promotionData.end_at)) {
                await session.abortTransaction();
                return NextResponse.json(
                    { error: 'End time must be after start time' },
                    { status: 400 }
                );
            }
        } else if (promotionData.start_at || promotionData.end_at) {
            // Partial date update validation
            const currentPromotion = await Promotion.findById(id).session(session);
            if (!currentPromotion) {
                await session.abortTransaction();
                return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
            }
            const newStart = promotionData.start_at ? new Date(promotionData.start_at) : currentPromotion.start_at;
            const newEnd = promotionData.end_at ? new Date(promotionData.end_at) : currentPromotion.end_at;

            if (newStart >= newEnd) {
                await session.abortTransaction();
                return NextResponse.json(
                    { error: 'Invalid time range: End time must be after start time' },
                    { status: 400 }
                );
            }
        }

        // 1. Update Promotion
        const updatedPromotion = await Promotion.findByIdAndUpdate(
            id,
            promotionData,
            { new: true, runValidators: true, session } // Pass session
        );

        if (!updatedPromotion) {
            await session.abortTransaction();
            return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
        }

        // 2. Update Items (If items array is provided)
        // Strategy: Delete all existing items and re-insert new ones to ensure full sync
        if (items && Array.isArray(items)) {
            // Delete old items
            await PromotionItem.deleteMany({ promotion_id: id }).session(session);

            // Insert new items
            if (items.length > 0) {
                const newItems = items.map((item: any) => ({
                    ...item,
                    promotion_id: id,
                }));
                await PromotionItem.insertMany(newItems, { session });
            }
        }

        await session.commitTransaction();
        return NextResponse.json(updatedPromotion);

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
