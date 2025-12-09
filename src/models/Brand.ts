import mongoose from 'mongoose';

const { Schema } = mongoose;

const BrandSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    logo_url: String,
    description: String,
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);

export default Brand;