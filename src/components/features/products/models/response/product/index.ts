export interface ProductAttribute {
    code: string;
    name: string;
    value: string;
}

export interface ProductSkuResponse {
    sku: string;
    price: number;
    original_price?: number;
    stock: number;
    image_url?: string;
    is_active: boolean;
    weight?: number;
    dimensions?: {
        l: number;
        w: number;
        h: number;
    };
    attributes?: ProductAttribute[];
}

export interface AttributeSummaryResponse {
    code: string;
    name: string;
    values: string[];
}

export interface ProductResponse {
    id: string; // _id
    name: string;
    slug: string;
    thumbnail_url?: string;
    category_id: string | { _id: string, name: string };
    brand_id?: string | { _id: string, name: string };
    product_type?: number;
    is_active: boolean;
    has_variants: boolean;
    attributes_summary?: AttributeSummaryResponse[];
    skus: ProductSkuResponse[];
    description?: string;
    short_description?: string;

    // Optional extended fields
    price?: number;
    original_price?: number; // Renamed from price_original
    stock?: number;
    images?: string; // Sometimes APIs return comma separated or array
    images_mobile?: string;
}
