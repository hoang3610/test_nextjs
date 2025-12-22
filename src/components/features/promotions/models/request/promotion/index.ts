export interface CreatePromotionRequest {
    name: string;
    description?: string;
    thumbnail_url?: string;
    start_at: string | Date; // Date string or object
    end_at: string | Date;
    status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FINISHED';
    is_auto_active?: boolean;
    items?: any[];
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {
    id: string;
}
