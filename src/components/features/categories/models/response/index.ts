export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    parent_id?: string | null;
    sort_order?: number;
    createdAt?: string;
    updatedAt?: string;
}
