import mongoose from 'mongoose';

const { Schema } = mongoose;

// -----------------------------------------------------------
// 1. SUB-SCHEMA CHO BIẾN THỂ (SKU) - [ĐÃ UPDATE]
// -----------------------------------------------------------
const ProductSkuSchema = new Schema({
    sku: { type: String, required: true },

    // --- CỤM GIÁ (PRICING STRATEGY) ---

    // 1. Giá bán hiện tại (Dynamic): Giá khách phải trả tiền ngay lúc này. 
    // Hệ thống sort/filter theo field này. Khi Sale thì giá này giảm, hết Sale thì giá này tăng lại.
    price: { type: Number, required: true },

    // 2. Giá niêm yết / Giá thị trường (Static): Dùng để gạch ngang cho oai (VD: Hãng bán 1tr, mình bán 800k).
    // Field này ít khi thay đổi.
    original_price: { type: Number, default: 0 },

    // 3. [MỚI] Giá bán thường (Backup): Giá bán lẻ của shop bạn khi KHÔNG có Sale. 
    // Dùng để khôi phục lại `price` khi hết chương trình khuyến mãi.
    regular_price: { type: Number, default: 0 },

    // 4. [MỚI] Giá Sale (Info): Lưu giá trị khuyến mãi để hiển thị label (VD: "Flash Sale 99k").
    // Nếu = 0 tức là không sale.
    sale_price: { type: Number, default: 0 },

    // -----------------------------------

    stock: { type: Number, default: 0, min: 0 },
    image_url: String,
    weight: { type: Number, default: 0 },
    dimensions: { l: Number, w: Number, h: Number },
    is_default: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    attributes: [{
        code: String, name: String, value: String, meta_value: String
    }]
});

// -----------------------------------------------------------
// 2. PRODUCT SCHEMA (CHA)
// -----------------------------------------------------------
const ProductSchema = new Schema({
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    short_description: String,
    description: String,
    thumbnail_url: String,

    category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand_id: { type: Schema.Types.ObjectId, ref: 'Brand' },

    is_active: { type: Boolean, default: true },
    has_variants: { type: Boolean, default: false },

    // Hình ảnh
    image_urls: [String],
    image_mobile_urls: [String],

    // Cache thuộc tính để filter nhanh (Màu, Size...)
    attributes_summary: [{
        code: String, name: String, values: [String]
    }],

    // Danh sách biến thể
    skus: [ProductSkuSchema],

    // -----------------------------------------------------------
    // [NEW] CÁC TRƯỜNG TÍNH NĂNG TRENDING & SALE
    // -----------------------------------------------------------

    // 1. Metrics & SEO
    sold_count: { type: Number, default: 0, index: true },
    view_count: { type: Number, default: 0 },
    is_featured: { type: Boolean, default: false, index: true },
    is_new_arrival: { type: Boolean, default: false },

    // 2. Price Range (Cho bộ lọc & Sort bên ngoài)
    min_price: { type: Number, index: true },
    max_price: { type: Number },

    // 3. Thời gian Sale (Countdown)
    sale_start_at: { type: Date, default: null, index: true },
    sale_end_at: { type: Date, default: null, index: true },

    // 4. [MỚI & QUAN TRỌNG] SKU Đại diện hiển thị
    // Giúp Frontend hiển thị đúng Ảnh + Giá của biến thể rẻ nhất/bán chạy nhất 
    // mà không cần chui vào mảng `skus` để tìm.
    variant_display: {
        sku: String,       // VD: "sku-do-s"
        price: Number,     // VD: 99.000
        image: String,     // VD: "anh-ao-do.jpg"
        label: String      // VD: "Màu Đỏ / S"
    }

}, { timestamps: true });

// -----------------------------------------------------------
// INDEXING
// -----------------------------------------------------------
ProductSchema.index({ category_id: 1, is_active: 1 });
ProductSchema.index({ sale_end_at: 1, is_active: 1 });
ProductSchema.index({ is_featured: -1, sold_count: -1 });
ProductSchema.index({ min_price: 1 });
ProductSchema.index({ name: 'text', description: 'text' }); // Thêm text search nếu cần

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;