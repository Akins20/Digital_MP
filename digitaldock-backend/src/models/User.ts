/**
 * User Model (Mongoose)
 * Handles user authentication and profile data
 */

import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export interface IUser extends Document {
  _id: string;
  email: string;
  emailVerified: Date | null;
  password: string | null; // null for OAuth users
  name: string | null;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  isVerifiedSeller: boolean;
  isPremium: boolean;
  premiumUntil: Date | null;

  // Seller fields
  sellerSlug: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  totalEarnings: number;
  totalSales: number;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      default: null,
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
    },
    isVerifiedSeller: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumUntil: {
      type: Date,
      default: null,
    },

    // Seller fields
    sellerSlug: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // Allow multiple null values
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
      default: null,
    },
    twitter: {
      type: String,
      default: null,
    },
    instagram: {
      type: String,
      default: null,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Never return password
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ sellerSlug: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isPremium: 1 });

// Virtual for product count (will populate later)
userSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'seller',
});

// Export model
export const User = model<IUser>('User', userSchema);
