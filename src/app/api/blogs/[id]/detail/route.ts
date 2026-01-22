import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import '@/models/User';
import '@/models/BlogCategory';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;

        const blog = await BlogPost.findById(id)
            .populate('category_id', 'name slug')
            .populate('author_id', 'full_name avatar_url bio');

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog post not found' },
                { status: 404 }
            );
        }

        // Increment view count (Optional logic, fit for Detail API)
        // await BlogPost.findByIdAndUpdate(id, { $inc: { view_count: 1 } }); 

        return NextResponse.json(blog);

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
