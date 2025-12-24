
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const OrderItemSchema = new Schema({
    // Reference to Product (for linking/analytics)
    order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },

    // Variant Info (if applicable)
    sku: { type: String, required: true }, // e.g., "SKU-123" or "default"

    // --- SNAPSHOT FIELDS (Crucial for history) ---
    // Save these at the moment of purchase. Do NOT rely on Product reference for these.
    name: { type: String, required: true },
    image_url: { type: String },

    // Pricing Snapshot
    price: { type: Number, required: true }, // Final sale price per unit at purchase time
    original_price: { type: Number, default: 0 }, // Market price at purchase time

    quantity: { type: Number, required: true, min: 1 },

    // Calculations
    total_line_amount: { type: Number, required: true }, // = price * quantity

    // Metadata
    attributes: [{
        name: String,
        value: String
    }],
}, { _id: true, timestamps: true, collection: 'order_items' });

// We export the Model if we want to save items individually in 'order_items' collection
const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);

export default OrderItem;
