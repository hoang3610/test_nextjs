import mongoose, { Schema, model, models } from 'mongoose';

const GuestSchema = new Schema({
    // Identity
    full_name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone_number: { type: String, required: true, trim: true, index: true },

    // Contact Info (Captured from Checkout)
    addresses: [{
        province: { code: Number, name: String },
        district: { code: Number, name: String },
        ward: { code: Number, name: String },
        street_address: String,
        type: { type: String, default: 'SHIPPING' } // Context of address
    }],

    // Tracking / CRM
    first_seen_at: { type: Date, default: Date.now },
    last_order_at: { type: Date, default: null }, // Last time they placed an order
    order_count: { type: Number, default: 0 },

    // Notes
    note: { type: String }, // Admin notes about this guest (e.g., "Potential spam", "VIP guest")

}, { timestamps: true });

// Indexes for looking up guests by phone/email
GuestSchema.index({ phone_number: 1 });
GuestSchema.index({ email: 1 });

const Guest = models.Guest || model('Guest', GuestSchema);

export default Guest;
