import {model, Schema, Types} from "mongoose";

export type RatingKey = 1 | 2 | 3 | 4 | 5;

export interface BookRating {
    _id: Types.ObjectId;
    bookId: number;
    reviewCount: number;
    ratingSum: number;
    averageRating: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    updatedAt: Date;
}

// @ts-ignore
// TS2589
const bookRatingSchema = new Schema<BookRating>(
    {
        bookId: {
            type: Number,
            required: true,
            unique: true,
            ref: 'Book'
        },
        reviewCount: {
            type: Number,
            required: true,
            default: 0
        },
        ratingSum: {
            type: Number,
            required: true,
            default: 0
        },
        averageRating: {
            type: Number,
            required: true,
            default: 0
        },
        ratingDistribution: {
            5: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            1: { type: Number, default: 0 }
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false
    }
);

bookRatingSchema.index({ bookId: 1 }, { unique: true });

export const BookRatingModel = model<BookRating>("BookRating", bookRatingSchema);