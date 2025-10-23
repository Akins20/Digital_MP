/**
 * Product Model (Mongoose)
 * Handles digital product listings
 */

import { Schema, model, models, Document, Types } from 'mongoose';

export enum ProductCategory {
  NOTION_TEMPLATES = 'NOTION_TEMPLATES',
  FIGMA_ASSETS = 'FIGMA_ASSETS',
  RESUME_TEMPLATES = 'RESUME_TEMPLATES',
  SPREADSHEET_TEMPLATES = 'SPREADSHEET_TEMPLATES',
  SOCIAL_MEDIA_TEMPLATES = 'SOCIAL_MEDIA_TEMPLATES',
  PRESENTATION_TEMPLATES = 'PRESENTATION_TEMPLATES',
  WEBSITE_TEMPLATES = 'WEBSITE_TEMPLATES',
  ICON_PACKS = 'ICON_PACKS',
  EBOOKS_GUIDES = 'EBOOKS_GUIDES',
  CHEAT_SHEETS = 'CHEAT_SHEETS',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  UNLISTED = 'UNLISTED',
  REJECTED = 'REJECTED',
}

export interface IProduct extends Document {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: ProductCategory;
  price: number;
  isPWYW: boolean; // Pay What You Want
  minPrice: number | null;

  // Files
  fileUrl: string; // Main product file (S3/R2 URL)
  fileSize: number; // in bytes
  previewUrl: string | null; // Preview/demo file
  images: string[]; // Array of image URLs

  // Metadata
  tags: string[];
  downloadCount: number;
  viewCount: number;
  rating: number; // Average rating (0-5)
  reviewCount: number;

  // Status
  status: ProductStatus;
  isFeatured: boolean;
  featuredUntil: Date | null;

  // Relations
  seller: Types.ObjectId; // Reference to User

  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },
    isPWYW: {
      type: Boolean,
      default: false,
    },
    minPrice: {
      type: Number,
      default: null,
      min: [0, 'Minimum price must be non-negative'],
    },

    // Files
    fileUrl: {
      type: String,
      required: [true, 'Product file is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size must be non-negative'],
    },
    previewUrl: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 5;
        },
        message: 'Maximum 5 images allowed',
      },
    },

    // Metadata
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10;
        },
        message: 'Maximum 10 tags allowed',
      },
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Status
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.DRAFT,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
      default: null,
    },

    // Relations
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.seller = ret.seller.toString();
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
productSchema.index({ slug: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Text index for search
productSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});

// Compound indexes
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// Pre-save middleware to generate slug
productSchema.pre('save', async function (next) {
  if (this.isModified('title') && !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await models.Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Export model
export const Product = models.Product || model<IProduct>('Product', productSchema);
