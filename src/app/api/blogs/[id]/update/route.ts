import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        // Check Slug Duplication if slug is being updated
        if (body.slug) {
            const existingBlog = await BlogPost.findOne({
                slug: body.slug,
                _id: { $ne: id }
            });
            if (existingBlog) {
                return NextResponse.json(
                    { error: 'Slug already exists' },
                    { status: 400 }
                );
            }
        }

        const updatedBlog = await BlogPost.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            return NextResponse.json(
                { error: 'Blog post not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedBlog);

    } catch (error: any) {
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Invalid blog ID' },
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
