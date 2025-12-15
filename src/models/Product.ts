import mongoose from 'mongoose';

const { Schema } = mongoose;

// Sub-schema cho biến thể (SKU) - Không cần tạo model riêng
const ProductSkuSchema = new Schema({
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    original_price: { type: Number },
    stock: { type: Number, default: 0, min: 0 },

    image_url: String,

    weight: { type: Number, default: 0 },
    dimensions: {
        l: Number,
        w: Number,
        h: Number
    },

    is_default: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },

    // Snapshot giá trị thuộc tính
    attributes: [{
        code: String, // "color"
        name: String, // "Màu sắc"
        value: String, // "Đen"
        meta_value: String // "#000000"
    }]
});

const ProductSchema = new Schema({
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    short_description: String,
    description: String,
    thumbnail_url: String,

    // References
    category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand_id: { type: Schema.Types.ObjectId, ref: 'Brand' },

    is_active: { type: Boolean, default: true },
    has_variants: { type: Boolean, default: false },
    image_urls: [String],
    image_mobile_urls: [String],

    // Faceted Search Summary
    attributes_summary: [{
        code: String, // "size"
        name: String, // "Size"
        values: [String] // ["6.0 inch", "5.5 inch"]
    }],

    // SKUS LIST
    skus: [ProductSkuSchema]

}, { timestamps: true });

// Indexing
// 1. Index ghép để lọc theo danh mục và trạng thái nhanh
ProductSchema.index({ category_id: 1, is_active: 1 });

// 2. Index giá trong mảng SKUs để sort/filter theo giá
// MongoDB hỗ trợ Multikey Index cho mảng
ProductSchema.index({ "skus.price": 1 });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;