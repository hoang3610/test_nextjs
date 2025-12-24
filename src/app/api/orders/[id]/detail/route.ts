
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import OrderItem from '@/models/OrderItem';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // Ensure models are registered to avoid MissingSchemaError with populate
        // We do this by referencing them, or relying on the import side-effects.
        // Explicitly ensuring OrderItem is loaded.
        const _ = OrderItem;

        // Await params (Next.js 15 requirement)
        const params = await props.params;
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Missing order ID' },
                { status: 400 }
            );
        }

        const order = await Order.findById(id).populate('items');

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: order });
    } catch (error: any) {
        console.error('Error fetching order detail:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch order detail', error: error.message },
            { status: 500 }
        );
    }
}
