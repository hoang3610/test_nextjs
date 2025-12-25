
import mongoose from 'mongoose';

const { Schema } = mongoose;

const DistrictSchema = new Schema({
    code: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    codename: { type: String, required: true },
    division_type: { type: String, required: true },
    province_code: { type: Number, required: true, index: true } // Reference to Province.code
}, {
    timestamps: true
});

const District = mongoose.models.District || mongoose.model('District', DistrictSchema);

export default District;
