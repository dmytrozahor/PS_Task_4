import axios from 'axios';

import type { Review } from "../types/reviews.types";
import ApplicationConfig from '../../config/application.config.ts'

interface GetReviewsResponse {
    reviews: Review[];
    nextCursor: string | null;
}

const createReviewApi = async (
    review: Omit<Review, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Review> => {
    const response = await axios.post(
        `${ApplicationConfig.REVIEW_SERVICE}`,
        review
    );
    return response.data.data;
};

const updateReviewApi = async (
    review: Review
): Promise<Review> => {
    const response = await axios.put(
        `${ApplicationConfig.REVIEW_SERVICE}/${review._id}`,
        review
    );
    return response.data.data;
};

const deleteReviewApi = async (reviewId: string): Promise<void> => {
    await axios.delete(`${ApplicationConfig.REVIEW_SERVICE}/${reviewId}`);
};


const getReviewsApi = async (
    bookId: number,
    limit: number,
    cursor?: string | null
): Promise<GetReviewsResponse> => {
    const response = await axios.get(`${ApplicationConfig.REVIEW_SERVICE}`, {
        params: {
            bookId,
            limit,
            from: cursor,
        },
    });

    return {
        reviews: response.data.data.reviews,
        nextCursor: response.data.data.nextCursor ?? null,
    };
};

export {
    createReviewApi,
    updateReviewApi,
    deleteReviewApi,
    getReviewsApi
}