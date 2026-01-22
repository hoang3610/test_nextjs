import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;

        const deletedBlog = await BlogPost.findByIdAndDelete(id);

        if (!deletedBlog) {
            return NextResponse.json(
                { error: 'Blog post not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Blog post deleted successfully' },
            { status: 200 }
        );

    } catch (error: any) {
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Invalid blog ID' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
