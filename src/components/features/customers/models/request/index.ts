export interface CategoryRequest {
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    parent_id?: string | null;
    is_active?: boolean;
    sort_order?: number;
}

export interface CategoryClient {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    parent_id?: string | null;
    sort_order?: number;
}
