import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        // Check if category exists
        const category = await Category.findById(id);
        if (!category) {
            return NextResponse.json(
                { error: 'Không tìm thấy danh mục' },
                { status: 404 }
            );
        }

        // Update fields
        // Allowing flexible updates based on payload
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        return NextResponse.json(updatedCategory);
    } catch (error: any) {
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Không tìm thấy danh mục' },
                { status: 400 }
            );
        }
        // Handle duplicate key error specially if needed
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Slug đã tồn tại' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
