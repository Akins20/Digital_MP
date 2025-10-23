/**
 * Purchase Model (Mongoose)
 * Handles product purchases and transactions
 */

import { Schema, model, Document, Types } from 'mongoose';

export enum PurchaseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentProvider {
  PAYSTACK = 'PAYSTACK',
  STRIPE = 'STRIPE',
  MANUAL = 'MANUAL',
}

export interface IPurchase extends Document {
  _id: string;
  buyer: Types.ObjectId;
  product: Types.ObjectId;
  seller: Types.ObjectId;

  // Payment details
  amount: number;
  currency: string;
  paymentProvider: PaymentProvider;
  paymentReference: string;
  paymentStatus: PurchaseStatus;

  // Transaction metadata
  transactionId: string | null;
  paymentMetadata: any;

  // Download info
  downloadCount: number;
  lastDownloadAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
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
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      uppercase: true,
      default: 'USD',
    },
    paymentProvider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: [true, 'Payment provider is required'],
    },
    paymentReference: {
      type: String,
      required: [true, 'Payment reference is required'],
      unique: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PurchaseStatus),
      default: PurchaseStatus.PENDING,
      index: true,
    },
    transactionId: {
      type: String,
      default: null,
      index: true,
    },
    paymentMetadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastDownloadAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
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

// Indexes for performance
purchaseSchema.index({ buyer: 1, createdAt: -1 });
purchaseSchema.index({ seller: 1, createdAt: -1 });
purchaseSchema.index({ product: 1, buyer: 1 });
purchaseSchema.index({ paymentStatus: 1, createdAt: -1 });

export const Purchase = model<IPurchase>('Purchase', purchaseSchema);
