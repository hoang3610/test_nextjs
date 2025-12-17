import { ProductResponse } from "@/components/features/products/models/response/product";

export interface PromotionItemResponse {
    _id: string;
    promotion_id: string;
    product_id: string | ProductResponse; // Có thể populate
    sku: string;
    product_name?: string;
    sku_name?: string;
    original_price: number;
    sale_price: number;
    discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discount_value: number;
    stock_sale: number;
    sold_sale: number;
    max_quantity_per_user: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface PromotionResponse {
    _id: string;
    name: string;
    description?: string;
    thumbnail_url?: string;
    start_at: string;
    end_at: string;
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FINISHED';
    is_auto_active: boolean;
    createdAt?: string;
    updatedAt?: string;

    // Optional extended fields (for detail view)
    items?: PromotionItemResponse[];
}
