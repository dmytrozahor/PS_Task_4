import express from "express";
import { z } from 'zod';

import { countReviews, createReview, deleteReview, editReview, listReviews } from "../controllers/review-controller";
import {
    GetCountsForBooksDto,
    GetReviewsFromDto,
    ReviewCreateDto,
    ReviewDeleteDto,
    ReviewEditDto
} from "../dtos/review.dto";
import { BookServiceAdapter } from "../adapters/bookservice.adapter";
import { ApiError } from "@/utils/ApiError";

const router = express.Router();

type ValidateSource = 'body' | 'query' | 'params' | 'all';

const validate = (schema: z.ZodSchema, source: ValidateSource = 'body') => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            let dataToValidate: any;

            switch (source) {
                case 'body':
                    dataToValidate = req.body;
                    break;
                case 'query':
                    dataToValidate = {
                        ...req.query,
                        limit: req.query.limit ? Number(req.query.limit) : undefined
                    };
                    break;
                case 'params':
                    dataToValidate = req.params;
                    break;
                case 'all':
                    dataToValidate = {
                        ...req.body,
                        ...req.query,
                        ...req.params
                    };
                    break;
            }

            req.body = schema.parse(dataToValidate);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const validationError = new ApiError(error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                    code: issue.code
                })), 400, "Validation failed");

                return res.status(400).json(validationError);
            }
            next(error);
        }
    };
};

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
router.post("/review", validate(ReviewCreateDto, 'body'), populationValidation, createReview);
router.get("/review", validate(GetReviewsFromDto, 'query'), listReviews);

router.put("/review/:_id", validate(ReviewEditDto, 'body'), editReview);
router.delete("/review/:_id", validate(ReviewDeleteDto, 'params'), deleteReview);

router.post("/review/_counts", validate(GetCountsForBooksDto, 'body'), countReviews);

export default router;
