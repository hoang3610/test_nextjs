import mongoose from 'mongoose';

const { Schema } = mongoose;

export const BlogPostStatus = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED'
};

const BlogPostSchema = new Schema({
    // Content Core
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    excerpt: String,
    content: String,
    thumbnail_url: String,

    // Relation
    author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category_id: { type: Schema.Types.ObjectId, ref: 'BlogCategory', required: true },
    
    // Tagging
    tags: [String],

    // Status & Visibility
    status: {
        type: String,
        enum: Object.values(BlogPostStatus),
        default: BlogPostStatus.DRAFT,
        index: true
    },
    is_featured: { type: Boolean, default: false, index: true },
    published_at: { type: Date, default: null, index: true },

    // Metrics
    view_count: { type: Number, default: 0 },

    // SEO
    meta_title: String,
    meta_description: String,
    
}, { timestamps: true });

// Indexes
BlogPostSchema.index({ category_id: 1, status: 1 });
BlogPostSchema.index({ published_at: -1, status: 1 });

// Prevent overwrite model error in Next.js
const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);

export default BlogPost;
