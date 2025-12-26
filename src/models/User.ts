import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  // Identity
  full_name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  password: { type: String }, // Optional for OAuth
  phone_number: { type: String, trim: true },

  // Auth & Permissions
  role: {
    type: String,
    enum: ['CUSTOMER', 'ADMIN', 'STAFF'],
    default: 'CUSTOMER'
  },
  auth_provider: {
    type: String,
    enum: ['credentials', 'google', 'facebook'],
    default: 'credentials'
  },
  provider_id: { type: String }, // User ID from Google/FB
  is_email_verified: { type: Boolean, default: false },

  // Profile
  avatar_url: { type: String },
  bio: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  date_of_birth: { type: Date },

  // E-commerce: Addresses
  addresses: [{
    full_name: String, // Receiver name
    phone_number: String,
    province: { code: Number, name: String },
    district: { code: Number, name: String },
    ward: { code: Number, name: String },
    street_address: String,
    is_default: { type: Boolean, default: false },
    type: { type: String, enum: ['HOME', 'OFFICE'], default: 'HOME' }
  }],

  // E-commerce: Persona
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  viewed_products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

  // System Status
  is_blocked: { type: Boolean, default: false },
  last_login: { type: Date },

  // Notifications
  newsletter_subscribed: { type: Boolean, default: true }

}, { timestamps: true });

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ phone_number: 1 });

const User = models.User || model('User', UserSchema);

export default User;