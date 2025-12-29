import { type ThunkDispatch } from 'redux-thunk'
import { type AnyAction } from 'redux'
import { type RootState } from '../stores/reviews.store.ts'

export interface Review {
    _id: string;
    bookId: number;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

export const CREATE_REVIEW = 'CREATE_REVIEW'
export const EDIT_REVIEW = 'EDIT_REVIEW'
export const DELETE_REVIEW = 'DELETE_REVIEW'

export const REQUEST_REVIEWS = 'REQUEST_REVIEWS'
export const RECEIVE_REVIEWS = 'RECEIVE_REVIEWS'
export const ERROR_RECEIVE_REVIEWS = 'ERROR_RECEIVE_REVIEWS'

export type AppDispatch = ThunkDispatch<
    RootState,
    unknown,
    AnyAction
>