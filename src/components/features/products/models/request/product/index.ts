export interface ProductAttributeValue {
    code: string;
    name: string;
    value: string;
    meta_value?: string;
}

export interface ProductSkuRequest {
    sku: string;
    price: number;
    original_price?: number;
    stock: number;
    image_url?: string;
    weight?: number;
    dimensions?: {
        l: number;
        w: number;
        h: number;
    };
    is_default: boolean;
    is_active: boolean;
    attributes: ProductAttributeValue[];
}

export interface AttributeSummaryRequest {
    code: string;
    name: string;
    values: string[];
}

export interface ProductRequest {
    name: string;
    slug: string;
    description?: string;
    thumbnail_url?: string;

    category_id: string; // ObjectId
    brand_id?: string; // ObjectId

    is_active: boolean;
    has_variants: boolean;

    attributes_summary?: AttributeSummaryRequest[];
    skus: ProductSkuRequest[];
}
