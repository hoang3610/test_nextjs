import mongoose from 'mongoose';

const { Schema } = mongoose;

// Sub-schema cho biến thể (SKU) - Giữ nguyên
const ProductSkuSchema = new Schema({
    sku: { type: String, required: true },
    price: { type: Number, required: true },         // Giá bán thực tế
    original_price: { type: Number },                // Giá gốc (để gạch ngang)
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
    image_urls: [String],
    image_mobile_urls: [String],

    attributes_summary: [{
        code: String, name: String, values: [String]
    }],

    skus: [ProductSkuSchema],

    // -----------------------------------------------------------
    // [NEW] CÁC TRƯỜNG CẦN THÊM ĐỂ LÀM TÍNH NĂNG TRENDING & SALE
    // -----------------------------------------------------------

    // 1. Cho mục "Sản phẩm Thịnh Hành" (Trending)
    sold_count: { type: Number, default: 0, index: true }, // Tổng số lượng đã bán của TẤT CẢ SKUs cộng lại
    view_count: { type: Number, default: 0 },              // Lượt xem sản phẩm
    is_featured: { type: Boolean, default: false, index: true }, // Admin ghim thủ công lên top

    // 2. Cho mục "Sản phẩm Sale" & Hiển thị giá range ngoài list
    // Lý do: Để sort giá hoặc lọc giá mà không cần chui vào mảng skus
    min_price: { type: Number, index: true }, // Giá thấp nhất trong các SKU
    max_price: { type: Number },              // Giá cao nhất trong các SKU

    // Thời gian Sale (Áp dụng cho toàn bộ sản phẩm)
    // Nếu logic sale từng SKU quá phức tạp, hãy quản lý Sale Time ở cấp Product
    sale_start_at: { type: Date, default: null, index: true },
    sale_end_at: { type: Date, default: null, index: true },

    // 3. Cho mục "Sản phẩm Mới" (Ngoài created_at có sẵn)
    is_new_arrival: { type: Boolean, default: false } // Cờ thủ công nếu muốn ghim sản phẩm cũ thành mới

}, { timestamps: true }); // Tự động có createdAt, updatedAt

// -----------------------------------------------------------
// INDEXING (Cập nhật lại)
// -----------------------------------------------------------

// 1. Lọc danh mục cơ bản
ProductSchema.index({ category_id: 1, is_active: 1 });

// 2. Lọc sản phẩm Sale (Còn hạn và đang active)
ProductSchema.index({ sale_end_at: 1, is_active: 1 });

// 3. Sort sản phẩm Thịnh hành (Ưu tiên Featured trước, rồi đến Sold Count)
ProductSchema.index({ is_featured: -1, sold_count: -1 });

// 4. Sort theo Giá (Dùng min_price thay vì skus.price sẽ nhanh hơn)
ProductSchema.index({ min_price: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;