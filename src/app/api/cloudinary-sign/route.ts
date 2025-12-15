import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { getCloudinaryPublicConfig } from '@/lib/cloudinary'; // Import helper

export async function POST(request: Request) {
    const body = await request.json();
    const { folder = 'ecommerce_products' } = body;

    const config = getCloudinaryPublicConfig();

    const timestamp = Math.round((new Date).getTime() / 1000);

    // We need api_secret to sign. 
    // If using CLOUDINARY_URL, cloudinary.config().api_secret should be populated globally by src/lib/cloudinary
    // But explicit signing usually requires passing the secret if not using the uploader method directly

    // Check if cloudinary.config() has the secret (it should be set by imports if using CLOUDINARY_URL)
    // However, better to rely on env vars or parsing if needed. 
    // Since src/lib/cloudinary runs `configureCloudinary()` on import, the global config is set.

    const apiSecret = cloudinary.config().api_secret || process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
        return NextResponse.json({ error: "Missing API Secret" }, { status: 500 });
    }

    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: folder
    }, apiSecret);

    return NextResponse.json({
        timestamp,
        signature,
        api_key: config.api_key,
        cloud_name: config.cloud_name // Return cloud_name too!
    });
}
