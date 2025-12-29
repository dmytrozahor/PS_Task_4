import {
    type Review,
    REQUEST_REVIEWS,
    RECEIVE_REVIEWS,
    ERROR_RECEIVE_REVIEWS,
    type AppDispatch, EDIT_REVIEW, CREATE_REVIEW, DELETE_REVIEW,
} from '../types/reviews.types';

import {
    createReviewApi,
    updateReviewApi,
    deleteReviewApi,
    getReviewsApi
} from '../adapter/review-api.adapter.ts'

export interface CreateReviewAction {
    type: typeof CREATE_REVIEW;
    review: Review;
}

export interface EditReviewAction {
    type: typeof EDIT_REVIEW;
    review: Review;
}

export interface RequestReviewsAction {
    type: typeof REQUEST_REVIEWS;
}

export interface ReceiveReviewsAction {
    type: typeof RECEIVE_REVIEWS;
    reviews: Review[];
    nextCursor: string | null;
    append: boolean;
}

export interface ErrorReceiveReviewsAction {
    type: typeof ERROR_RECEIVE_REVIEWS;
}

export interface DeleteReviewAction {
    type: typeof DELETE_REVIEW;
    reviewId: string;
}

export type ReviewsAction =
    | RequestReviewsAction
    | ReceiveReviewsAction
    | ErrorReceiveReviewsAction
    | CreateReviewAction
    | EditReviewAction
    | DeleteReviewAction;

export const createReviewAction = (review: Review): CreateReviewAction => ({
    type: CREATE_REVIEW,
    review,
});

export const editReviewAction = (review: Review): EditReviewAction => ({
    type: EDIT_REVIEW,
    review,
});

export const deleteReviewAction = (reviewId: string): DeleteReviewAction => ({
    type: DELETE_REVIEW,
    reviewId,
});

export const requestReviews = (): RequestReviewsAction => ({
    type: REQUEST_REVIEWS,
});

export const receiveReviews = (
    reviews: Review[],
    nextCursor: string | null,
    append: boolean
): ReceiveReviewsAction => ({
    type: RECEIVE_REVIEWS,
    reviews,
    nextCursor,
    append,
});

export const errorReceiveReviews = (): ErrorReceiveReviewsAction => ({
    type: ERROR_RECEIVE_REVIEWS,
});

export interface FetchReviewsArgs {
    bookId: number;
    limit: number;
    cursor?: string | null;
}

export const createReview =
    (payload: Omit<Review, '_id' | 'createdAt' | 'updatedAt'>) =>
        async (dispatch: AppDispatch): Promise<void> => {
            try {
                const created = await createReviewApi(payload);
                dispatch(createReviewAction(created));
            } catch (error) {
                console.error('Create review failed', error);
            }
        };

export const editReview =
    (review: Review) =>
        async (dispatch: AppDispatch): Promise<void> => {
            try {
                const updated = await updateReviewApi(review);
                dispatch(editReviewAction(updated));
            } catch (error) {
                console.error('Edit review failed', error);
            }
        };

export const deleteReview =
    (reviewId: string) =>
        async (dispatch: AppDispatch): Promise<void> => {
            try {
                await deleteReviewApi(reviewId);
                dispatch(deleteReviewAction(reviewId));
            } catch (error) {
                console.error('Delete review failed', error);
            }
        };

export const fetchReviews =
    ({ bookId, limit, cursor = null }: FetchReviewsArgs) =>
        async (dispatch: AppDispatch): Promise<void> => {
            dispatch(requestReviews());

            try {
                const { reviews, nextCursor } = await getReviewsApi(bookId, limit, cursor);

                console.log(nextCursor)

                dispatch(
                    receiveReviews(
                        reviews,
                        nextCursor,
                        Boolean(cursor)
                    )
                );
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
                dispatch(errorReceiveReviews());
            }
        };
