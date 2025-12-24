
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import OrderItem from '@/models/OrderItem';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await dbConnect();

        // Fetch orders, newest first
        // POPULATE items to get them from the order_items collection
        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .populate('items');

        return NextResponse.json({ success: true, count: orders.length, data: orders });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch orders', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    let session: mongoose.ClientSession | null = null;
    try {
        await dbConnect();
        session = await mongoose.startSession();
        session.startTransaction();

        const body = await req.json();
        const {
            user_id,
            shipping_address,
            items,
            payment_method,
            note
        } = body;

        // 1. Basic Validation
        if (!user_id) {
            throw new Error('Missing user_id');
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Values for items must be a non-empty array');
        }
        if (!shipping_address || !shipping_address.full_name || !shipping_address.phone_number) {
            throw new Error('Invalid shipping_address. Full name and phone are required.');
        }

        // 2. Calculate Totals & Prepare Items Data
        let subtotal_amount = 0;
        const processedItemsData = items.map((item: any) => {
            if (!item.product_id || !item.sku || !item.name || !item.price || !item.quantity) {
                throw new Error('Invalid item format. Missing required fields in item.');
            }
            const totalLineWithQty = Number(item.price) * Number(item.quantity);
            subtotal_amount += totalLineWithQty;

            return {
                ...item,
                total_line_amount: totalLineWithQty
            };
        });

        const shipping_fee = body.shipping_fee || 0;
        const discount_amount = body.discount_amount || 0;
        const grand_total = subtotal_amount + shipping_fee - discount_amount;

        // 3. Generate Order Code
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const order_code = `ORD-${timestamp}-${randomSuffix}`;

        // 4. Create Order (Initial State)
        const newOrder = new Order({
            user_id,
            order_code,
            shipping_address,
            payment_method: payment_method || 'COD',
            // Items are VIRTUAL, so we don't save them here.
            subtotal_amount,
            shipping_fee,
            discount_amount,
            grand_total: Math.max(0, grand_total),
            note
        });

        // Save order first (part of transaction)
        await newOrder.save({ session });

        // 5. Create OrderItems
        const orderItemsToCreate = processedItemsData.map((itemData: any) => ({
            ...itemData,
            order_id: newOrder._id
        }));

        // Insert items to OrderItem collection
        await OrderItem.insertMany(orderItemsToCreate, { session });

        // 7. Commit Transaction
        await session.commitTransaction();
        await session.endSession();

        // Populate items for response or attach manually
        const responseData = newOrder.toObject();
        responseData.items = orderItemsToCreate; // Manually attaching for response consistency

        return NextResponse.json(
            { success: true, message: 'Order created successfully', data: responseData },
            { status: 201 }
        );

    } catch (error: any) {
        // Rollback on error
        if (session) {
            await session.abortTransaction();
            await session.endSession();
        }

        console.error('Error creating order:', error);

        const status = error.message.includes('Missing') || error.message.includes('Invalid') ? 400 : 500;

        return NextResponse.json(
            { success: false, message: 'Failed to create order', error: error.message },
            { status: status }
        );
    }
}
