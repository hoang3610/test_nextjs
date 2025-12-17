import mongoose from 'mongoose';

const { Schema } = mongoose;

export const PromotionStatus = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    FINISHED: 'FINISHED'
};

const PromotionSchema = new Schema({
    // 1. Thông tin hiển thị
    name: { type: String, required: true, index: true }, // VD: "Flash Sale 12.12"
    description: String,
    thumbnail_url: String, // Banner của chiến dịch

    // 2. Thời gian "vàng"
    start_at: { type: Date, required: true, index: true },
    end_at: { type: Date, required: true, index: true },

    // 3. Quản lý trạng thái
    status: {
        type: String,
        enum: Object.values(PromotionStatus),
        default: PromotionStatus.DRAFT,
        index: true
    },

    // 4. Cấu hình nâng cao (Optional)
    is_auto_active: { type: Boolean, default: true } // True: Đến giờ tự chạy cronjob active. False: Phải bấm tay.

}, { timestamps: true });

// Index kép: Tìm các campaign đang chạy trong khoảng thời gian X
PromotionSchema.index({ start_at: 1, end_at: 1, status: 1 });

const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', PromotionSchema);

export default Promotion;