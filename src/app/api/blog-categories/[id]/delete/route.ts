import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogCategory from '@/models/BlogCategory';
import BlogPost from '@/models/BlogPost';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;

        // Optional: Check if used by any blog post before delete
        // const usedCount = await BlogPost.countDocuments({ category_id: id });
        // if (usedCount > 0) {
        //     return NextResponse.json(
        //         { error: 'Cannot delete category containing posts' },
        //         { status: 400 }
        //     );
        // }

        const deleted = await BlogCategory.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Category deleted successfully' },
            { status: 200 }
        );

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
