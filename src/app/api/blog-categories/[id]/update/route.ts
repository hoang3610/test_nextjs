import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogCategory from '@/models/BlogCategory';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        if (body.slug) {
            const existing = await BlogCategory.findOne({
                slug: body.slug,
                _id: { $ne: id }
            });
            if (existing) {
                return NextResponse.json(
                    { error: 'Slug already exists' },
                    { status: 400 }
                );
            }
        }

        const updated = await BlogCategory.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);

    } catch (error: any) {
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Invalid ID' },
                { status: 400 }
            );
        }
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Duplicate key error' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
