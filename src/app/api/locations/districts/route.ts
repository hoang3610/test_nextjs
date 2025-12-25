
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import District from '@/models/District';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const provinceCode = searchParams.get('province_code');

        const query = provinceCode ? { province_code: provinceCode } : {};
        const districts = await District.find(query).sort({ name: 1 }).select('code name codename division_type province_code');

        return NextResponse.json(districts);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
