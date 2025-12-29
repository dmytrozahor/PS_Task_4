import {
    createStore,
    applyMiddleware,
    combineReducers,
    type Store,
} from 'redux'

import { thunk } from 'redux-thunk'
import type { ReviewsAction } from '../actions/reviews.action'
import { reviewsReducer } from '../reducers/reviews.reducer'

export const rootReducer = combineReducers({
    reviews: reviewsReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export const store: Store<RootState, ReviewsAction> = createStore(
    rootReducer,
    undefined,
    applyMiddleware(thunk)
)
