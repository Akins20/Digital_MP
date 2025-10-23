/**
 * Review Model (Mongoose)
 * Handles product reviews and ratings
 */

import { Schema, model, models, Document, Types } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  rating: number; // 1-5 stars
  comment: string | null;

  // Relations
  user: Types.ObjectId; // Reference to User
  product: Types.ObjectId; // Reference to Product

  // Moderation
  isApproved: boolean;
  isFlagged: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      default: null,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },

    // Relations
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      index: true,
    },

    // Moderation
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.user = ret.user.toString();
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
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // One review per user per product
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ createdAt: -1 });

// Update product rating after review changes
reviewSchema.post('save', async function () {
  const Product = models.Product;
  const productId = this.product;

  // Calculate average rating for approved reviews
  const stats = await models.Review.aggregate([
    {
      $match: {
        product: productId,
        isApproved: true,
      },
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
      reviewCount: stats[0].count,
    });
  }
});

// Update product rating after review deletion
reviewSchema.post('deleteOne', async function () {
  const Product = models.Product;
  const doc = await this.model.findOne(this.getFilter());

  if (doc) {
    const productId = doc.product;

    const stats = await models.Review.aggregate([
      {
        $match: {
          product: productId,
          isApproved: true,
        },
      },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0,
      });
    }
  }
});

// Export model
export const Review = models.Review || model<IReview>('Review', reviewSchema);
