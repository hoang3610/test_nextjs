import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import '@/models/Category'; // Ensure model is registered
import '@/models/Brand';    // Ensure model is registered

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return NextResponse.json(
                { error: 'category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'category deleted successfully' },
            { status: 200 }
        );

    } catch (error: any) {
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Invalid category ID' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
