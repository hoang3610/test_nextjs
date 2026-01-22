import mongoose from 'mongoose';

const { Schema } = mongoose;

const BlogCategorySchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    
    // Hierarchy (Optional)
    parent_id: { type: Schema.Types.ObjectId, ref: 'BlogCategory', default: null },

    is_active: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 }
}, { timestamps: true });

// Prevent overwrite model error in Next.js
const BlogCategory = mongoose.models.BlogCategory || mongoose.model('BlogCategory', BlogCategorySchema);

export default BlogCategory;
