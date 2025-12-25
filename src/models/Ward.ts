
import mongoose from 'mongoose';

const { Schema } = mongoose;

const WardSchema = new Schema({
    code: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    codename: { type: String, required: true },
    division_type: { type: String, required: true },
    district_code: { type: Number, index: true }, // Usually wards belong to districts
    province_code: { type: Number, index: true }  // Included per user example
}, {
    timestamps: true
});

const Ward = mongoose.models.Ward || mongoose.model('Ward', WardSchema);

export default Ward;
