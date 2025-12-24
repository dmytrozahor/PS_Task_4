import {Types} from "mongoose";
import {BookReviewModel, Review} from '../schema/review.model';
import {BookRatingModel} from '../schema/bookrating.model';
import {
    GetCountsForBooksDto,
    GetReviewsFromDto,
    PaginatedReviewsDto,
    ReviewCreateDto,
    ReviewsCountDto
} from "../dtos/review.dto";

export interface IReviewService {
    createReview(dto: ReviewCreateDto): Promise<Review>;
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

    async getReviewsFrom(dto: GetReviewsFromDto): Promise<PaginatedReviewsDto> {
        const limit = dto.limit ?? 20;
        const query: Record<string, any> = {
            bookId: dto.bookId
        };

        if (dto.from) {
            query._id = { $lt: new Types.ObjectId(dto.from) };
        }

        const docs = await BookReviewModel.find(query)
            .select('_id bookId rating comment createdAt')
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean()
            .exec();

        const hasNext = docs.length > limit;
        const items = hasNext ? docs.slice(0, limit) : docs;
        const nextCursor = hasNext ? items[items.length - 1]._id.toString() : null;

        const rating = await BookRatingModel
            .findOne({ bookId: dto.bookId })
            .limit(1)
            .lean()
            .exec();

        return {
            rating: {
                reviewCount: rating?.reviewCount ?? -1,
                averageRating: rating?.averageRating ?? -1
            },
            reviews: items.map(doc => ({
                _id: doc._id.toString(),
                bookId: doc.bookId,
                rating: doc.rating,
                comment: doc.comment,
                createdAt: doc.createdAt
            })),
            nextCursor
        };
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