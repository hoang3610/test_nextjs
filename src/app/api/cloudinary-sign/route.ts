import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    const body = await request.json();
    const { folder = 'ecommerce_products' } = body;

    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: folder
    }, process.env.CLOUDINARY_API_SECRET!);

    return NextResponse.json({
        timestamp,
        signature,
        api_key: process.env.CLOUDINARY_API_KEY
    });
}
