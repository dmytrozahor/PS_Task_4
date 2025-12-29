import {Types} from "mongoose";
import {BookReviewModel, Review} from '../schema/review.model';
import {BookRatingModel, RatingKey} from '../schema/bookrating.model';
import {
    GetCountsForBooksDto,
    GetReviewsFromDto,
    PaginatedReviewsDto,
    ReviewCreateDto,
    ReviewDeleteDto,
    ReviewEditDto,
    ReviewsCountDto
} from "../dtos/review.dto";

export interface IReviewService {
    createReview(dto: ReviewCreateDto): Promise<Review>;
    editReview(dto: ReviewEditDto): Promise<Review | null> ;
    deleteReview(dto: ReviewDeleteDto): Promise<Review | null>;
    getReviewsFrom(dto: GetReviewsFromDto): Promise<PaginatedReviewsDto>;
    getCountsForBooks(dto: GetCountsForBooksDto): Promise<ReviewsCountDto[]>;
}

export const ReviewService: IReviewService = {
    async createReview(dto: ReviewCreateDto): Promise<Review> {
        const review = await BookReviewModel.create({
            bookId: dto.bookId,
            rating: dto.rating,
            comment: dto.comment
        });

        const ratingDoc = await BookRatingModel.findOneAndUpdate(
            { bookId: dto.bookId },
            {
                $inc: {
                    reviewCount: 1,
                    ratingSum: dto.rating,
                    [`ratingDistribution.${dto.rating}`]: 1
                },
                $set: {
                    updatedAt: new Date()
                }
            },
            {
                upsert: true,
                new: true
            }
        ).lean();

        if (ratingDoc) {
            await BookRatingModel.updateOne(
                { bookId: dto.bookId },
                { $set: { averageRating: ratingDoc.ratingSum / ratingDoc.reviewCount } }
            );
        }

        return review;
    },

    async editReview(dto: ReviewEditDto): Promise<Review | null> {
        await BookReviewModel.updateOne(
            { _id: dto._id },
            {
                $set: {
                    rating: dto.rating,
                    comment: dto.comment,
                    updatedAt: new Date()
                }
            }
        ).exec();

        return BookReviewModel.findById(dto._id)
            .lean()
            .exec();
    },

    async deleteReview(dto: ReviewDeleteDto): Promise<Review | null> {
        const review = await BookReviewModel.findByIdAndDelete(dto._id).lean().exec();

        if (!review) return null;

        const ratingDoc = await BookRatingModel.findOne({ bookId: review.bookId }).exec();
        if (ratingDoc) {
            const ratingSum = (ratingDoc.ratingSum || 0) - review.rating;
            const reviewCount = Math.max((ratingDoc.reviewCount || 1) - 1, 0);

            const updatedDistribution = { ...ratingDoc.ratingDistribution };
            const key = review.rating as RatingKey;
            updatedDistribution[key] = Math.max((updatedDistribution[key] || 1) - 1, 0);

            await BookRatingModel.updateOne(
                { bookId: review.bookId },
                {
                    $set: {
                        ratingSum,
                        reviewCount,
                        ratingDistribution: updatedDistribution,
                        averageRating: reviewCount > 0 ? ratingSum / reviewCount : 0,
                        updatedAt: new Date()
                    }
                }
            ).exec();
        }

        return review;
    },

    async getReviewsFrom(dto: GetReviewsFromDto): Promise<PaginatedReviewsDto> {
        const limit = dto.limit ?? 20;

        const matchStage: Record<string, any> = { bookId: dto.bookId };
        if (dto.from) {
            matchStage._id = { $lt: new Types.ObjectId(dto.from) };
        }

        // _id = ObjectId timestamp-based, so they're monotonically increasing,
        // sort them descending to comply with requirements
        const result = await BookReviewModel.aggregate([
            { $match: matchStage },
            { $sort: { _id: -1 } },
            { $limit: limit + 1 },
            {
                $lookup: {
                    from: "bookratings",
                    localField: "bookId",
                    foreignField: "bookId",
                    as: "ratingSummary"
                }
            },
            { $unwind: { path: "$ratingSummary", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    bookId: 1,
                    rating: 1,
                    comment: 1,
                    createdAt: 1,
                    reviewCount: "$ratingSummary.reviewCount",
                    averageRating: "$ratingSummary.averageRating"
                }
            }
        ]).exec();

        const hasNext = result.length > limit;
        const items = result.slice(0, limit);
        const nextCursor = hasNext ? result[limit]._id.toString() : null;

        const rating = items[0]
            ? {
                reviewCount: items[0].reviewCount ?? 0,
                averageRating: items[0].averageRating ?? 0
            }
            : { reviewCount: 0, averageRating: 0 };

        const reviews = items.map(doc => ({
            _id: doc._id.toString(),
            bookId: doc.bookId,
            rating: doc.rating,
            comment: doc.comment,
            createdAt: doc.createdAt
        }));

        return { rating, reviews, nextCursor };
    },

    async getCountsForBooks(dto: GetCountsForBooksDto): Promise<ReviewsCountDto[]> {
        const bookIds = dto.bookIds;

        return await Promise.all(
            bookIds.map(async (bookId) => {
                const count = await BookReviewModel.countDocuments({ bookId });
                return {bookId, count};
            })
        );
    }
};