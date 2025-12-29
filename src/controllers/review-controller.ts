import {NextFunction, Request, Response} from "express";
import {ApiSuccess} from "../utils/ApiSucess";
import {asyncHandler} from "../middleware/async-middleware";
import {ReviewService} from "../services/review.service";

export const listReviews = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const reviews = await ReviewService.getReviewsFrom(req.body);

        res.status(200).json(new ApiSuccess(reviews, "OK"));
    },
);

export const createReview = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const createdReview = await ReviewService.createReview(req.body);

        res.status(200).json(new ApiSuccess(createdReview, "OK"))
    },
);
export const editReview = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const createdReview = await ReviewService.editReview(req.body);

        res.status(200).json(new ApiSuccess(createdReview, "OK"))
    },
);

export const deleteReview = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const createdReview = await ReviewService.deleteReview(req.body);

        res.status(200).json(new ApiSuccess(createdReview, "OK"))
    },
);

export const countReviews = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const reviewCounts = await ReviewService.getCountsForBooks(req.body);

        res.status(200).json(new ApiSuccess(reviewCounts, "OK"));
    },
);