import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Guest from '@/models/Guest';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const params = await props.params;
        const { id } = params;

        const guest = await Guest.findById(id);

        if (!guest) {
            return NextResponse.json(
                { success: false, message: 'Guest not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: guest
        });

    } catch (error: any) {
        console.error('Error fetching guest detail:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch guest detail', error: error.message },
            { status: 500 }
        );
    }
}
