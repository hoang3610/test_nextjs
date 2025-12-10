import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

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
