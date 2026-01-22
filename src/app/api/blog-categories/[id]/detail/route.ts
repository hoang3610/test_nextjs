import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogCategory from '@/models/BlogCategory';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;

        const category = await BlogCategory.findById(id);

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);

    } catch (error: any) {
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Invalid ID' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
