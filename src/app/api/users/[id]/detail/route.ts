import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;

        // 1. Lấy thông tin User
        const user = await User.findById(id).select('-password');

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // 2. Lấy danh sách Order của User này (Mô phỏng cấu trúc lấy items của Promotion)
        const orders = await Order.find({ user_id: id })
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: {
                ...user.toObject(),
                orders: orders
            }
        });

    } catch (error: any) {
        console.error('Error fetching user detail:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
