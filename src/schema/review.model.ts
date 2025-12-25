import {Schema, Types, model } from 'mongoose';

export interface Review {
    _id: Types.ObjectId;
    bookId: number;
    rating: number;
    comment?: string;
    createdAt: Date;
}

// @ts-ignore
// TS2589
const reviewSchema = new Schema<Review>(
    {
        bookId: {
            type: Number,
            required: true,
            ref: 'Book'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comment: {
            type: String,
            maxlength: 1000
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

// Compound index for cursor-based pagination (most important)
reviewSchema.index({ bookId: 1, _id: -1 });

// Index for getting reviews by specific IDs efficiently
reviewSchema.index({ _id: 1 });

// Optional: If you need to query by rating
reviewSchema.index({ bookId: 1, rating: -1, _id: -1 });

export const BookReviewModel = model<Review>("BookReview", reviewSchema);