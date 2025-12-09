import mongoose from 'mongoose';

const { Schema } = mongoose;

const CategorySchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image_url: String,

    parent_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null },

    // Materialized Path Pattern
    ancestors: [{
        _id: { type: Schema.Types.ObjectId, ref: 'Category' },
        name: String,
        slug: String
    }],

    is_active: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;