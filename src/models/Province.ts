
import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProvinceSchema = new Schema({
    code: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    codename: { type: String, required: true },
    division_type: { type: String, required: true },
    phone_code: { type: Number, required: true }
}, {
    timestamps: true
});

const Province = mongoose.models.Province || mongoose.model('Province', ProvinceSchema);

export default Province;
