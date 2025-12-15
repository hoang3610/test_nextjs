import { v2 as cloudinary } from 'cloudinary';

// Helper to configure Cloudinary and get credentials
const configureCloudinary = () => {
    // If CLOUDINARY_URL is present, it takes precedence for server-side operations
    if (process.env.CLOUDINARY_URL) {
        cloudinary.config({
            secure: true
        });
        return;
    }

    // Fallback to individual env vars
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
};

// Call configuration immediately
configureCloudinary();

// Helper to extract public config for client
export const getCloudinaryPublicConfig = () => {
    if (process.env.CLOUDINARY_URL) {
        // Parse CLOUDINARY_URL: cloudinary://api_key:api_secret@cloud_name
        try {
            const url = process.env.CLOUDINARY_URL;
            const split1 = url.split('@'); // [cloudinary://key:secret, cloud_name]
            const cloudName = split1[1];

            const split2 = split1[0].split('://'); // [cloudinary, key:secret]
            const split3 = split2[1].split(':');   // [key, secret]
            const apiKey = split3[0];

            return {
                cloud_name: cloudName,
                api_key: apiKey
            };
        } catch (e) {
            console.error("Invalid CLOUDINARY_URL format");
            return {
                cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY
            };
        }
    }

    return {
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY
    };
};


/**
 * Uploads a Base64 image string to Cloudinary.
 * If the input is already a URL or empty, it returns it as is.
 * @param fileStr Base64 string or URL
 * @param folder Optional folder name in Cloudinary
 * @returns Secure URL of the uploaded image
 */
export const uploadToCloudinary = async (fileStr: string | undefined, folder: string = 'ecommerce_products'): Promise<string> => {
    if (!fileStr || typeof fileStr !== 'string') return '';

    // If it's already a URL (http/https), assume it's already uploaded.
    if (fileStr.startsWith('http') || fileStr.startsWith('https')) {
        return fileStr;
    }

    try {
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            folder: folder,
            resource_type: 'auto',
        });
        return uploadResponse.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('upload hình thất bại');
    }
};
