
import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderSchema = new Schema({
    // User info
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Identity
    order_code: { type: String, required: true, unique: true, index: true }, // e.g., "ORD-172938"

    // Status Flow
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
        default: 'PENDING',
        index: true
    },

    // Payment
    payment_status: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
    },
    payment_method: {
        type: String,
        enum: ['COD', 'BANKING'],
        default: 'COD'
    },

    // Customer Info (Snapshot address to prevent issues if user changes address later)
    shipping_address: {
        full_name: { type: String, required: true },
        phone_number: { type: String, required: true },
        city: String,
        district: String,
        ward: String,
        street_address: String,
        note: String
    },

    // Items (REMOVED Embedding, using Virtual instead)

    // Pricing
    subtotal_amount: { type: Number, required: true, min: 0 }, // Sum of items
    shipping_fee: { type: Number, default: 0 },
    discount_amount: { type: Number, default: 0 }, // Coupon or direct discount
    grand_total: { type: Number, required: true, min: 0 }, // Final amount top pay

    // Notes
    note: { type: String },

    // Tracking
    history: [{
        status: String,
        note: String,
        updated_at: { type: Date, default: Date.now },
        updated_by: { type: Schema.Types.ObjectId, ref: 'User' } // Admin or System or Customer
    }]

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for common queries
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'shipping_address.phone_number': 1 });

// Virtual Populate
OrderSchema.virtual('items', {
    ref: 'OrderItem',
    localField: '_id',
    foreignField: 'order_id'
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
