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
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Check for duplicate slug if slug is being updated
        if (body.slug && body.slug !== category.slug) {
            const existingSlug = await Category.findOne({ slug: body.slug });
            if (existingSlug) {
                return NextResponse.json(
                    { error: 'Slug already exists' },
                    { status: 400 }
                );
            }
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
                { error: 'Invalid category ID' },
                { status: 400 }
            );
        }
        // Handle duplicate key error specially if needed
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Duplicate key error (slug must be unique)' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
