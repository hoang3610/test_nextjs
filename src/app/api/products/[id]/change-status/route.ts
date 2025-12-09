import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { error: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }

        // Update fields
        // Allowing flexible updates based on payload
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Không tìm thấy sản phẩm' },
                { status: 400 }
            );
        }
        // Handle duplicate key error specially if needed
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Tên sản phẩm đã tồn tại' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
