/**
 * Purchase Model (Mongoose)
 * Handles product purchases and transactions
 */

import { Schema, model, models, Document, Types } from 'mongoose';

export enum PurchaseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export interface IPurchase extends Document {
  _id: string;

  // Relations
  buyer: Types.ObjectId; // Reference to User
  product: Types.ObjectId; // Reference to Product

  // Payment details
  amount: number; // Amount paid
  platformFee: number; // Our cut
  sellerEarnings: number; // Seller's cut
  paymentMethod: string; // stripe, paypal
  stripeSessionId: string | null;
  paypalOrderId: string | null;

  // Status
  status: PurchaseStatus;
  refundedAt: Date | null;
  refundReason: string | null;

  // Download tracking
  downloadCount: number;
  lastDownloadAt: Date | null;
  downloadToken: string; // Secure download link

  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
    // Relations
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      index: true,
    },

    // Payment details
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be non-negative'],
    },
    platformFee: {
      type: Number,
      required: [true, 'Platform fee is required'],
      min: [0, 'Platform fee must be non-negative'],
    },
    sellerEarnings: {
      type: Number,
      required: [true, 'Seller earnings is required'],
      min: [0, 'Seller earnings must be non-negative'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['stripe', 'paypal'],
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
    paypalOrderId: {
      type: String,
      default: null,
    },

    // Status
    status: {
      type: String,
      enum: Object.values(PurchaseStatus),
      default: PurchaseStatus.PENDING,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundReason: {
      type: String,
      default: null,
      maxlength: [500, 'Refund reason cannot exceed 500 characters'],
    },

    // Download tracking
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastDownloadAt: {
      type: Date,
      default: null,
    },
    downloadToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.buyer = ret.buyer.toString();
        ret.product = ret.product.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
purchaseSchema.index({ buyer: 1, product: 1 });
purchaseSchema.index({ downloadToken: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ createdAt: -1 });

// Compound indexes
purchaseSchema.index({ buyer: 1, createdAt: -1 });
purchaseSchema.index({ product: 1, createdAt: -1 });

// Export model
export const Purchase = models.Purchase || model<IPurchase>('Purchase', purchaseSchema);
