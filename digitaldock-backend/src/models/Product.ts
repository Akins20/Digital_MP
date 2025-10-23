/**
 * Product Model (Mongoose)
 * Handles digital product listings
 */

import { Schema, model, Document, Types } from 'mongoose';

export enum ProductCategory {
  EBOOKS = 'EBOOKS',
  TEMPLATES = 'TEMPLATES',
  GRAPHICS = 'GRAPHICS',
  SOFTWARE = 'SOFTWARE',
  COURSES = 'COURSES',
  MUSIC = 'MUSIC',
  VIDEOS = 'VIDEOS',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  FONTS = 'FONTS',
  PRESETS = 'PRESETS',
  OTHER = 'OTHER',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface IProduct extends Document {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  category: ProductCategory;
  tags: string[];
  price: number;
  originalPrice: number | null;
  currency: string;

  // Seller info
  seller: Types.ObjectId;

  // Product details
  files: {
    url: string;
    name: string;
    size: number;
    type: string;
  }[];
  coverImage: string;
  images: string[];
  demoUrl: string | null;

  // Metadata
  status: ProductStatus;
  featured: boolean;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;

  // Requirements
  requirements: string | null;
  includesUpdates: boolean;
  includesSupport: boolean;

  // SEO
  metaTitle: string | null;
  metaDescription: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      default: null,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      required: [true, 'Product category is required'],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: null,
      min: [0, 'Original price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
      index: true,
    },
    files: {
      type: [
        {
          url: { type: String, required: true },
          name: { type: String, required: true },
          size: { type: Number, required: true },
          type: { type: String, required: true },
        },
      ],
      default: [],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 10;
        },
        message: 'Cannot have more than 10 images',
      },
    },
    demoUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.DRAFT,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    requirements: {
      type: String,
      default: null,
      maxlength: [1000, 'Requirements cannot exceed 1000 characters'],
    },
    includesUpdates: {
      type: Boolean,
      default: false,
    },
    includesSupport: {
      type: Boolean,
      default: false,
    },
    metaTitle: {
      type: String,
      default: null,
      maxlength: [60, 'Meta title cannot exceed 60 characters'],
    },
    metaDescription: {
      type: String,
      default: null,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
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
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ totalSales: -1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// Virtual for purchases
productSchema.virtual('purchases', {
  ref: 'Purchase',
  localField: '_id',
  foreignField: 'product',
});

// Pre-save middleware to generate slug
productSchema.pre('save', async function (next) {
  if (this.isModified('title') && !this.slug) {
    let baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists and append number if needed
    while (await (this.constructor as any).findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

export const Product = model<IProduct>('Product', productSchema);
