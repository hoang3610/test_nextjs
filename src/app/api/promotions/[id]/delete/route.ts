import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Promotion from '@/models/Promotion';
import PromotionItem from '@/models/PromotionItem';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    let session = null;
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;

        // Start Transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Delete associated PromotionItems first
        await PromotionItem.deleteMany({ promotion_id: id }).session(session);

        // 2. Delete the Promotion itself
        const deletedPromotion = await Promotion.findByIdAndDelete(id).session(session);

        if (!deletedPromotion) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { error: 'Promotion not found' },
                { status: 404 }
            );
        }

        // Commit Transaction
        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(
            { message: 'Promotion deleted successfully' },
            { status: 200 }
        );

    } catch (error: any) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Invalid promotion ID' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
