import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Promotion from '@/models/Promotion';
import PromotionItem from '@/models/PromotionItem';
import Product from '@/models/Product'; // Import Product for population

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;

        // 1. Lấy thông tin chiến dịch
        const promotion = await Promotion.findById(id);

        if (!promotion) {
            return NextResponse.json(
                { error: 'Promotion not found' },
                { status: 404 }
            );
        }

        // 2. Lấy danh sách sản phẩm trong chiến dịch
        // Populate để lấy tên, hình ảnh sản phẩm gốc cho đẹp
        const items = await PromotionItem.find({ promotion_id: id })
            .populate('product_id', 'name thumbnail_url code') // Lấy thông tin cơ bản của product
            .lean();

        return NextResponse.json({
            ...promotion.toObject(),
            items: items
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
