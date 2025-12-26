export interface GuestResponse {
    _id: string; // Mongoose ID
    full_name: string;
    email?: string;
    phone_number: string;
    addresses: {
        province?: { code: number; name: string };
        district?: { code: number; name: string };
        ward?: { code: number; name: string };
        street_address?: string;
        type?: string;
    }[];
    order_count: number;
    last_order_at?: string;
    first_seen_at?: string;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}
