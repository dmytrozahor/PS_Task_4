import express from "express";

import {countReviews, createReview, deleteReview, editReview, listReviews} from "./controllers/review.controller";
import {
    GetCountsForBooksDto,
    GetReviewsFromDto,
    ReviewCreateDto,
    ReviewDeleteDto,
    ReviewEditDto
} from "./dtos/review.dto";

import {BookServiceAdapter} from "../adapters/book-service.adapter";
import {ApiError} from "@/utils/ApiError";
import {RequestValidator} from '@/utils/RequestValidator'

const router = express.Router();

const populationValidation = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction) =>
{
    const validData = req.body;

    if (validData.bookId) {
        const bookIdExists = await BookServiceAdapter.existsByBookId(validData.bookId);

        if (!bookIdExists) {
            return res.status(404).json(
                new ApiError({}, 404, "Book with the submitted bookId wasn't found on the backend")
            );
        }
    }

    next();
}

// Routes
router.post("/", RequestValidator.validate(ReviewCreateDto, 'body'), populationValidation, createReview);
router.get("/", RequestValidator.validate(GetReviewsFromDto, 'query'), listReviews);

router.put("/:_id", RequestValidator.validate(ReviewEditDto, 'body'), editReview);
router.delete("/:_id", RequestValidator.validate(ReviewDeleteDto, 'params'), deleteReview);

router.post("/_counts", RequestValidator.validate(GetCountsForBooksDto, 'body'), countReviews);

export default router;
