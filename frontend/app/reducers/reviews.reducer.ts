import {
    type Review,

    CREATE_REVIEW,
    EDIT_REVIEW,
    DELETE_REVIEW,
    REQUEST_REVIEWS,
    RECEIVE_REVIEWS,
    ERROR_RECEIVE_REVIEWS,
} from '../types/reviews.types'
import type { ReviewsAction } from '../actions/reviews.action'

export interface ReviewsState {
    loading: boolean;
    data: Review[];
    error: boolean;
    nextCursor: string | null;
}

const initialState: ReviewsState = {
    loading: false,
    data: [],
    error: false,
    nextCursor: null,
};

export const reviewsReducer = (
    state = initialState,
    action: ReviewsAction
): ReviewsState => {
    switch (action.type) {

        case REQUEST_REVIEWS:
            return {
                ...state,
                loading: true,
                error: false,
            };

        case RECEIVE_REVIEWS:
            return {
                ...state,
                loading: false,
                data: action.append
                    ? [...state.data, ...action.reviews]
                    : action.reviews,
                nextCursor: action.nextCursor,
            };

        case ERROR_RECEIVE_REVIEWS:
            return {
                ...state,
                loading: false,
                error: true,
            };

        case CREATE_REVIEW:
            return {
                ...state,
                data: [action.review, ...state.data], // newest on top
            };

        case EDIT_REVIEW:
            return {
                ...state,
                data: state.data.map((review) =>
                    review._id === action.review._id ? action.review : review
                ),
            };

        case DELETE_REVIEW:
            return {
                ...state,
                data: state.data.filter(
                    (review) => review._id !== action.reviewId
                ),
            };

        default:
            return state;
    }
};
