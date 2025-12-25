
export interface OrderResponse {
    _id: string;
    order_code: string;
    user_id: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
    payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    payment_method: 'COD' | 'BANKING';
    shipping_address: {
        full_name: string;
        phone_number: string;
        province?: { code: number; name: string };
        district?: { code: number; name: string };
        ward?: { code: number; name: string };
        street_address?: string;
        note?: string;
    };
    subtotal_amount: number;
    shipping_fee: number;
    discount_amount: number;
    grand_total: number;
    createdAt: string;
    updatedAt: string;
    items?: any[]; // Populated items
}
