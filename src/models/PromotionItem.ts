import mongoose from 'mongoose';

const { Schema } = mongoose;

export const DiscountType = {
    PERCENTAGE: 'PERCENTAGE',
    FIXED_AMOUNT: 'FIXED_AMOUNT'
};

const PromotionItemSchema = new Schema({
    // 1. Liên kết (References)
    promotion_id: { type: Schema.Types.ObjectId, ref: 'Promotion', required: true, index: true }, // Thuộc chiến dịch nào?
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },   // Sản phẩm nào?

    // 2. Định danh SKU (Quan trọng với schema Product của bạn)
    sku: { type: String, required: true }, // Mã SKU cụ thể (VD: "sku-2"). 
    // Lưu ý: Flash sale thường setup trên từng SKU (Màu đỏ sale, màu xanh không sale)

    product_name: String, // Cache tên sản phẩm để hiển thị nhanh ở Admin List mà không cần populate
    sku_name: String,     // Cache tên SKU (VD: "Màu Đỏ - Size S")

    // 3. Cấu hình Giá (Pricing Logic)
    original_price: { type: Number, required: true }, // Giá gốc tại thời điểm add vào chiến dịch (VD: 100k)
    sale_price: { type: Number, required: true },     // Giá bán chốt hạ (VD: 80k). Backend tự tính hoặc Admin nhập.

    discount_type: {
        type: String,
        enum: Object.values(DiscountType),
        default: DiscountType.PERCENTAGE
    },

    discount_value: { type: Number, required: true }, // VD: 20 (nếu là %) hoặc 20000 (nếu là amount)

    // 4. Quản lý Kho Sale (Inventory) - Tránh bán lố
    stock_sale: { type: Number, required: true, min: 1 }, // Số lượng dành riêng cho Sale (VD: 50 cái)
    sold_sale: { type: Number, default: 0 },              // Đã bán được bao nhiêu (Dùng $inc để cập nhật)

    // 5. Giới hạn mua (Optional)
    max_quantity_per_user: { type: Number, default: 0 } // 0 = Không giới hạn. >0 = Mỗi người chỉ được mua X cái.

}, { timestamps: true });

// Index kép quan trọng:
// 1. Để lấy list sản phẩm của 1 chiến dịch
PromotionItemSchema.index({ promotion_id: 1 });

// 2. Để check xem sản phẩm này có đang nằm trong chiến dịch khác không (Tránh trùng)
PromotionItemSchema.index({ product_id: 1, sku: 1, promotion_id: 1 });

const PromotionItem = mongoose.models.PromotionItem || mongoose.model('PromotionItem', PromotionItemSchema);

export default PromotionItem;