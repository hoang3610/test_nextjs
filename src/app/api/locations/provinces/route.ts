
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Province from '@/models/Province';

export async function GET() {
    try {
        await dbConnect();
        const provinces = await Province.find({}).sort({ name: 1 }).select('code name codename division_type phone_code');
        return NextResponse.json(provinces);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
