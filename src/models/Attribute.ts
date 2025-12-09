import mongoose from 'mongoose';

const { Schema } = mongoose;

const AttributeSchema = new Schema({
    name: { type: String, required: true }, // VD: "Màu sắc"
    code: { type: String, required: true, unique: true }, // VD: "color"
    type: { type: Number, default: 1 }, // 1: Text, 2: Select, 3: Color Picker
    is_filterable: { type: Boolean, default: true },

    // EMBED OPTIONS
    options: [{
        value: { type: String, required: true }, // VD: "Đen"
        meta_value: { type: String }, // VD: "#000000"
        display_order: { type: Number, default: 0 }
    }]
}, { timestamps: true });

// Next.js Fix: Kiểm tra xem model đã tồn tại chưa trước khi compile
const Attribute = mongoose.models.Attribute || mongoose.model('Attribute', AttributeSchema);

export default Attribute;