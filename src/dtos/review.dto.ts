import {z} from 'zod';

export const ReviewDto = z.object({
    _id: z.string(),
    bookId: z.number(),
    rating: z.number(),
    comment: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date().optional(),
    __v: z.number().optional()
});

export const ReviewCreateDto = z.object({
    bookId: z.number(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(1).max(1000).optional()
});

export const GetReviewsFromDto = z.object({
    bookId: z.coerce.number(),
    limit: z.number().int().positive().optional(),
    from: z.string().optional()
});

export const GetCountsForBooksDto = z.object({
    bookIds: z.array(z.number())
});

export const BookRatingDto = z.object({
    reviewCount: z.number(),
    averageRating: z.number()
});

export const PaginatedReviewsDto = z.object({
    rating: BookRatingDto,
    reviews: z.array(ReviewDto),
    nextCursor: z.string().nullable()
});

export const ReviewsCountDto = z.object({
    bookId: z.number(),
    count: z.number()
});

export type BookRatingDto = z.infer<typeof BookRatingDto>;

export type ReviewCreateDto = z.infer<typeof ReviewCreateDto>;
export type GetReviewsFromDto = z.infer<typeof GetReviewsFromDto>;
export type GetCountsForBooksDto = z.infer<typeof GetCountsForBooksDto>;
export type PaginatedReviewsDto = z.infer<typeof PaginatedReviewsDto>;
export type ReviewsCountDto = z.infer<typeof ReviewsCountDto>;