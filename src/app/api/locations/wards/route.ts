
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Ward from '@/models/Ward';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const districtCode = searchParams.get('district_code');
        const provinceCode = searchParams.get('province_code');

        let query = {};
        if (districtCode) {
            query = { district_code: districtCode };
        } else if (provinceCode) {
            query = { province_code: provinceCode };
        }

        const wards = await Ward.find(query).sort({ name: 1 }).select('code name codename division_type district_code province_code');

        return NextResponse.json(wards);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
