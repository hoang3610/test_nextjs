
interface SignatureResponse {
    timestamp: number;
    signature: string;
    api_key: string;
}

// Helper to convert Base64 to Blob
const base64ToBlob = (base64: string): Blob => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

export const uploadImageClient = async (fileStr: string, folder: string = 'ecommerce_products'): Promise<string> => {
    if (!fileStr) return '';
    // If it's already a URL, return it
    if (fileStr.startsWith('http') || fileStr.startsWith('https')) {
        return fileStr;
    }

    try {
        // 1. Get signature
        const signResponse = await fetch('/api/cloudinary-sign', {
            method: 'POST',
            body: JSON.stringify({ folder }),
        });

        if (!signResponse.ok) {
            throw new Error('Failed to get upload signature');
        }

        const { timestamp, signature, api_key } = await signResponse.json() as SignatureResponse;
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

        if (!cloudName || !api_key) {
            throw new Error('Missing Cloudinary configuration');
        }

        // 2. Upload to Cloudinary
        const formData = new FormData();

        // OPTIMIZATION: Convert Base64 to Blob if needed
        if (fileStr.startsWith('data:')) {
            const blob = base64ToBlob(fileStr);
            formData.append('file', blob);
        } else {
            formData.append('file', fileStr);
        }

        formData.append('api_key', api_key);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!uploadRes.ok) {
            const err = await uploadRes.json();
            throw new Error(err.message || 'Upload failed');
        }

        const data = await uploadRes.json();
        return data.secure_url;
    } catch (error) {
        console.error('Client upload error:', error);
        throw error;
    }
};
